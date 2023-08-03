import '../styles/components/folder-input.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { SessionStore } from './utils/session-store';
import { Loader } from './components/loader.js';
import { PathHelper } from './helpers/path-helper';
import { Metadata } from './app/metadata';
import { SuccessOverlay, ErrorOverlay } from './components/overlay';
import { CSVHelper } from './helpers/csv-helper';
import { FileHelper } from './helpers/file-helper';
import { StringHelper } from './helpers/string-helper';
import { MutexHelper } from './helpers/mutex-helper';

const os = nw.require('os');
const path = nw.require('path');
const fs = nw.require('fs');
const crypto = nw.require('crypto');

const router = new Router();
router.disableBackButton();

const loader = new Loader();

SessionStore.clear({
  keep: ['data-path', 'analysis', 'require-setup', 'locked-participant']
});

if ('locked-participant' in sessionStorage) {
  const participant = PathHelper.sanitizePath(
    sessionStorage.getItem('locked-participant').toString().toLowerCase().trim()
  );

  const participantLabel = StringHelper.revertParticipantNameFromSession(participant);

  try {
    await MutexHelper.unlock(participant);
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Internal Error`,
      details: `cannot unlock participant: ${participantLabel}. Message: ${error.message}`,
      interact: true,
      interactBtnLabel: 'retry',
      redirect: 'converter'
    });

    errorOverlay.show();
  }
}

const menu = new Menu();
menu.init();
menu.setItemActive('hpf-converter');

const folderInput = document.querySelector('.folder-input');
const dropArea = document.querySelector('.folder-drop-area');
const chooseButton = document.querySelector('.choose-btn');
const folderMessage = document.querySelector('.folder-msg');
const submitButton = document.querySelector('button[type="submit"]');

folderInput.setAttribute('nwworkingdir', os.homedir());

let dataPath = null;

const toggleDropAreaActive = () => {
  dropArea.classList.toggle('is-active');
  chooseButton.classList.toggle('is-active');
  folderMessage.classList.toggle('is-active');
};

folderInput.addEventListener('dragenter', () => {
  toggleDropAreaActive();
});

folderInput.addEventListener('dragleave', () => {
  toggleDropAreaActive();
});

folderInput.addEventListener('drop', () => {
  toggleDropAreaActive();
});

const toggleFolderPath = (path = null) => {
  if (!(folderMessage.querySelector('.folder-path') === null)) {
    folderMessage.querySelector('.folder-path').remove();
  }

  if (path === null) {
    chooseButton.innerText = 'choose a folder';
    folderMessage.querySelector('#text').innerText = `or drag and drop the folder here`;
    folderInput.setAttribute('nwworkingdir', os.homedir());
  } else {
    chooseButton.innerText = 'change folder';
    folderMessage.querySelector('#text').innerText = `selected folder path is`;
    folderInput.setAttribute('nwworkingdir', path);

    const folderPathDiv = document.createElement('div');
    folderPathDiv.classList.add('folder-path');
    folderPathDiv.appendChild(document.createTextNode(path));
    folderMessage.appendChild(folderPathDiv);
  }
};

if ('data-path' in sessionStorage) {
  dataPath = PathHelper.sanitizePath(
    sessionStorage.getItem('data-path').toString().trim()
  );
  toggleFolderPath(PathHelper.sanitizePath(dataPath));
  submitButton.removeAttribute('disabled');
}

folderInput.addEventListener('change', event => {
  if (event && event.target.files.length > 0) {
    const folder = event.target.files[0];

    toggleFolderPath(folder.path);
    dataPath = folder.path;
    sessionStorage.setItem('data-path', dataPath);

    if (submitButton.disabled) {
      submitButton.removeAttribute('disabled');
    }
  } else {
    toggleFolderPath();

    dataPath = null;

    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  }
});

submitButton.addEventListener('click', async () => {
  if (!submitButton.disabled) {
    loader.toggle({ message: 'Converting files...' });

    const metadata = new Metadata(dataPath);

    let isRootHPFFolder = true;
    let isBaseFolderContentCompliant;

    try {
      isBaseFolderContentCompliant = await metadata.checkBaseFolderContent(true);
    } catch (error) {
      isRootHPFFolder = false;
      loader.toggle();

      const errorOverlay = new ErrorOverlay({
        message: `Cannot verify content of input data folder`,
        details: `please ensure you have a folder named "HPF" under the selected root folder`,
        interact: true
      });

      errorOverlay.show();
      return;
    }

    const HPFPath = path.join(dataPath, 'hpf');

    if (isBaseFolderContentCompliant) {
      let files;

      try {
        files = await FileHelper.listAllFilesRecursive(HPFPath);
      } catch (error) {
        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `Cannot find files`,
          details: error.message,
          interact: true
        });

        errorOverlay.show();
        return;
      }

      if (files.length > 0) {
        const notConvertedFiles = [];

        for (const file of files) {
          const parsedFilePath = path.parse(file);
          const fileBasePathArray = parsedFilePath.dir.split(path.sep);
          const participantFolder = fileBasePathArray[fileBasePathArray.length - 1];
          const analysisFolder = fileBasePathArray[fileBasePathArray.length - 2];

          const analysisFilePath = path.join(
            dataPath,
            'Analysis',
            analysisFolder,
            participantFolder,
            `${parsedFilePath.name}.csv`
          );

          try {
            await fs.promises.stat(analysisFilePath);
          } catch (error) {
            if (error.code === 'ENOENT') {
              notConvertedFiles.push({
                destFolder: path.parse(analysisFilePath).dir,
                file
              });
            }
          }
        }

        const analysisFoldersFromFiles = [];

        if (notConvertedFiles.length > 0) {
          let totalFileCompleted = 0;
          let conversionError = false;

          const notConvertedFilesDistinct = notConvertedFiles.reduce((acc, current) => {
            if (!acc.filter(x => x.destFolder === current.destFolder).length) {
              acc.push(current);
            }
            return acc;
          }, []);

          for (const distinctFile of notConvertedFilesDistinct) {
            const distinctFilePathArray = distinctFile.destFolder.split(path.sep);
            const participantFolder =
              distinctFilePathArray[distinctFilePathArray.length - 1];
            const analysisFolder =
              distinctFilePathArray[distinctFilePathArray.length - 2];

            const metadataFolderPath = path.join(
              metadata.getMetadataRootFolder,
              analysisFolder,
              participantFolder
            );

            if (!analysisFoldersFromFiles.includes(analysisFolder)) {
              analysisFoldersFromFiles.push(analysisFolder);
            }

            try {
              await fs.promises.access(metadataFolderPath);
              await fs.promises.rm(metadataFolderPath, { recursive: true });
            } catch (error) {
              if (error.code === 'ENOENT') {
                continue;
              } else {
                loader.toggle();

                const errorOverlay = new ErrorOverlay({
                  message: `Cannot convert HPF File: ${path.basename(distinctFile.file)}`,
                  details: error.message,
                  interact: true
                });

                errorOverlay.show();
                break;
              }
            }
          }

          let currentFolder;

          for (const notConvertedFile of notConvertedFiles) {
            totalFileCompleted++;
            loader.loaderMessage.innerText = `Converting ${totalFileCompleted} / ${notConvertedFiles.length} files...`;

            try {
              await CSVHelper.convertFromHPF(`"${notConvertedFile.file}"`);
            } catch (error) {
              loader.toggle();

              conversionError = true;

              const errorOverlay = new ErrorOverlay({
                message: `Cannot convert HPF File: ${path.basename(
                  notConvertedFile.file
                )}`,
                details: error.message ?? error,
                interact: true
              });

              errorOverlay.show();
              break;
            }

            try {
              await fs.promises.mkdir(notConvertedFile.destFolder, { recursive: true });

              if (currentFolder !== notConvertedFile.destFolder) {
                currentFolder = notConvertedFile.destFolder;

                const currentFolderStat = await fs.promises.stat(currentFolder);

                const currentFolderName = path.parse(currentFolder).base;

                const digest = `${currentFolderName}-${currentFolderStat.birthtimeMs}`;

                const checksum = crypto.createHash('sha256').update(digest).digest('hex');

                const checksumFilePath = path.join(
                  currentFolder,
                  `.${checksum}.sha256sum`
                );

                await FileHelper.createFileOrDirectoryIfNotExists(checksumFilePath, {
                  isDirectory: false,
                  hidden: true
                });
              }

              if (notConvertedFile.file.includes('.hpf')) {
                const inputFilePath = path.join(
                  path.parse(notConvertedFile.file).dir,
                  `${path.basename(notConvertedFile.file, '.hpf')}.csv`
                );

                const outputFilePath = path.join(
                  notConvertedFile.destFolder,
                  `${path.basename(notConvertedFile.file, '.hpf')}.csv`
                );

                await CSVHelper.normalize(inputFilePath, outputFilePath);

                await fs.promises.unlink(inputFilePath);
              } else {
                await fs.promises.unlink(notConvertedFile.file);
              }
            } catch (error) {
              loader.toggle();

              conversionError = true;

              const errorOverlay = new ErrorOverlay({
                message: `Cannot convert HPF File: ${path.basename(
                  notConvertedFile.file
                )}`,
                details: error.message,
                interact: true
              });

              errorOverlay.show();
              break;
            }
          }

          if (!conversionError) {
            loader.toggle();

            const totalDetails =
              notConvertedFiles.length > 1
                ? `${notConvertedFiles.length} files`
                : `${notConvertedFiles.length} file`;

            const successOverlay = new SuccessOverlay({
              message: `Complete!`,
              details: `${totalDetails} successfully converted`,
              interact: true,
              redirect: 'data-discovering'
            });

            successOverlay.show();
          }
        } else {
          loader.toggle();

          const successOverlay = new SuccessOverlay({
            message: `All set!`,
            details: `There are no remaining files to convert`,
            interact: true,
            redirect: 'data-discovering'
          });

          successOverlay.show();
        }
      } else {
        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `File not found`,
          details: `there are no HPF files to convert`,
          interact: true
        });

        errorOverlay.show();
      }
    } else {
      if (isRootHPFFolder) {
        loader.toggle();

        sessionStorage.setItem('setup', 'analysis');

        const errorOverlay = new ErrorOverlay({
          message: `Raw Data Folder Structure Error`,
          details: `please ensure that you have created all the corresponding analyses for your raw data within the application`,
          interact: true,
          interactBtnLabel: 'Configure',
          redirect: 'data-configuration'
        });

        errorOverlay.show();
      }
    }
  }
});
