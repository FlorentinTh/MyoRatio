import '../styles/components/folder-input.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { SessionStore } from './utils/session-store';
import { LoaderOverlay } from './components/loader-overlay.js';
import { PathHelper } from './helpers/path-helper';
import { Metadata } from './utils/metadata';
import { SuccessOverlay, ErrorOverlay } from './components/overlay';
import { CSVHelper } from './helpers/csv-helper';
import { FileHelper } from './helpers/file-helper';

const os = nw.require('os');
const path = nw.require('path');
const fs = nw.require('fs');

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

SessionStore.clear({ keep: ['data-path', 'analysis'] });

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
  dataPath = sessionStorage.getItem('data-path').toString();
  toggleFolderPath(PathHelper.sanitizePath(dataPath));
  submitButton.removeAttribute('disabled');
}

folderInput.addEventListener('change', event => {
  if (event && event.target.files.length > 0) {
    const folder = event.target.files[0];

    toggleFolderPath(folder.path);
    dataPath = folder.path;

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
    loaderOverlay.toggle({ message: 'Converting files...' });

    const sanitizedPath = PathHelper.sanitizePath(dataPath);
    const metadata = new Metadata(sanitizedPath);

    let isRootHPFFolder = true;
    let isBaseFolderContentCompliant;

    try {
      isBaseFolderContentCompliant = await metadata.checkBaseFolderContent(true);
    } catch (error) {
      isRootHPFFolder = false;
      loaderOverlay.toggle();

      const errorOverlay = new ErrorOverlay({
        message: `Cannot verify content of input data folder`,
        details: `please ensure you have a folder named "HPF" under the selected root folder`,
        interact: true
      });

      errorOverlay.show();
    }

    const HPFPath = path.join(sanitizedPath, 'hpf');

    if (isBaseFolderContentCompliant) {
      let files;

      try {
        files = await FileHelper.listAllFilesRecursive(HPFPath);
      } catch (error) {
        loaderOverlay.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `Cannot find files`,
          details: error,
          interact: true
        });

        errorOverlay.show();
      }

      if (files.length > 0) {
        const notConvertedFiles = [];

        for (const file of files) {
          const parsedFilePath = path.parse(file);
          const fileBasePathArray = parsedFilePath.dir.split(path.sep);
          const participantFolder = fileBasePathArray[fileBasePathArray.length - 1];
          const analysisFolder = fileBasePathArray[fileBasePathArray.length - 2];

          const analysisFilePath = path.join(
            sanitizedPath,
            'analysis',
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

            try {
              await fs.promises.access(metadataFolderPath);
              await fs.promises.rm(metadataFolderPath, { recursive: true });
            } catch (error) {
              if (error.code === 'ENOENT') {
                continue;
              } else {
                loaderOverlay.toggle();

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

          for (const notConvertedFile of notConvertedFiles) {
            totalFileCompleted++;
            loaderOverlay.loaderMessage.innerText = `Converting ${totalFileCompleted} / ${notConvertedFiles.length} files...`;

            try {
              await fs.promises.mkdir(notConvertedFile.destFolder, { recursive: true });

              await CSVHelper.convertFromHPF(
                path.normalize(`"${notConvertedFile.file}"`)
              );

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
            } catch (error) {
              conversionError = true;

              loaderOverlay.toggle();

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
            loaderOverlay.toggle();

            const totalDetails =
              notConvertedFiles.length > 1
                ? `${notConvertedFiles.length} files`
                : `${notConvertedFiles.length} file`;

            const successOverlay = new SuccessOverlay({
              message: `Complete!`,
              details: `${totalDetails} successfully converted`,
              interact: true
            });

            successOverlay.show();
          }
        } else {
          loaderOverlay.toggle();

          const successOverlay = new SuccessOverlay({
            message: `All set!`,
            details: `There are no remaining files to convert`,
            interact: true
          });

          successOverlay.show();
        }
      } else {
        loaderOverlay.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `File not found`,
          details: `there are no HPF files to convert`,
          interact: true
        });

        errorOverlay.show();
      }
    } else {
      if (isRootHPFFolder) {
        loaderOverlay.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `Input data folder does not meet file structure requirements`,
          details: `please ensure that the "HPF" folder contains the following three folders: ${metadata.getBaseContent.join(
            ', '
          )} with your data organized by folders named after each participant`,
          interact: true
        });

        errorOverlay.show();
      }
    }
  }
});
