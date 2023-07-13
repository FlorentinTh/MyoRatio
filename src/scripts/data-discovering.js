import '../styles/components/folder-input.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Loader } from './components/loader.js';
import { ErrorOverlay } from './components/overlay.js';
import { Metadata } from './utils/metadata.js';
import { PathHelper } from './helpers/path-helper.js';
import { Switch } from './utils/switch';
import { SessionStore } from './utils/session-store';
import { Configuration } from './utils/configuration.js';
import { getAllParticipants } from './utils/participants';
import { PlatformHelper } from './helpers/platform-helper';

const os = nw.require('os');
const path = nw.require('path');

const router = new Router();
router.disableBackButton();

SessionStore.clear({ keep: ['data-path', 'analysis'] });

const loader = new Loader();
const configuration = await Configuration.load();

const menu = new Menu();
menu.init();
menu.setItemActive('home');

const folderInput = document.querySelector('.folder-input');
const dropArea = document.querySelector('.folder-drop-area');
const chooseButton = document.querySelector('.choose-btn');
const folderMessage = document.querySelector('.folder-msg');
const submitButton = document.querySelector('button[type="submit"]');

folderInput.setAttribute('nwworkingdir', os.homedir());

Switch.init('analysis');

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

const fetchParticipantIMUData = async (dataPath, analysis, participants) => {
  const port = localStorage.getItem('port') ?? configuration.PORT;

  return await fetch(`http://${configuration.HOST}:${port}/api/data/imu/`, {
    headers: {
      'X-API-Key': configuration.API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      data_path: dataPath,
      analysis,
      participants
    })
  });
};

if ('data-path' in sessionStorage) {
  const dataPath = sessionStorage.getItem('data-path').toString();
  toggleFolderPath(PathHelper.sanitizePath(dataPath));
  submitButton.removeAttribute('disabled');
}

folderInput.addEventListener('change', event => {
  if (event && event.target.files.length > 0) {
    const folder = event.target.files[0];

    toggleFolderPath(folder.path);
    sessionStorage.setItem('data-path', folder.path);

    if (submitButton.disabled) {
      submitButton.removeAttribute('disabled');
    }
  } else {
    toggleFolderPath();

    if (!(sessionStorage.getItem('data-path').toString() === null)) {
      sessionStorage.removeItem('data-path');
    }

    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  }
});

const rollWaitingMessage = (overlay, messages, index) => {
  overlay.loaderMessage.innerText = messages[0];
  overlay.loaderMessage.innerText += `\n ${messages[index]}`;

  if (index === 4) {
    index = 2;
  } else {
    index++;
  }

  setTimeout(rollWaitingMessage, 10000, overlay, messages, index);
};

submitButton.addEventListener('click', async () => {
  if (!submitButton.disabled) {
    loader.toggle({ message: 'Discovering data...' });

    if ('data-path' in sessionStorage) {
      const dataPath = sessionStorage.getItem('data-path').toString();

      const sanitizedPath = PathHelper.sanitizePath(dataPath);
      const metadata = new Metadata(sanitizedPath);

      let isBaseFolderContentCompliant;

      const redirectConverter = !PlatformHelper.isMacOsPlatform() ? 'converter' : '';

      try {
        isBaseFolderContentCompliant = await metadata.checkBaseFolderContent();
      } catch (error) {
        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `Cannot verify content of input data folder`,
          details: `please ensure that the HPF data has been converted properly`,
          interact: true,
          redirect: redirectConverter
        });

        errorOverlay.show();
        return;
      }

      let isMetadataFolderInit;

      if (isBaseFolderContentCompliant) {
        try {
          isMetadataFolderInit = await metadata.createMetadataFolderTree();
        } catch (error) {
          loader.toggle();

          const errorOverlay = new ErrorOverlay({
            message: `Application cannot initialize the metadata tree`,
            details: error.message,
            interact: true
          });

          errorOverlay.show();
          return;
        }
      } else {
        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `Input data folder does not meet file structure requirements`,
          details: `please ensure that the HPF data has been converted properly`,
          interact: true,
          redirect: redirectConverter
        });

        errorOverlay.show();
        return;
      }

      const analysisType = sessionStorage.getItem('analysis').toString();
      const dataFolderPathSession = sessionStorage.getItem('data-path').toString();

      const analysisFolderPath = path.join(
        dataFolderPathSession,
        'analysis',
        analysisType
      );

      let participants;

      if (isMetadataFolderInit) {
        participants = await getAllParticipants(
          PathHelper.sanitizePath(analysisFolderPath)
        );
      }

      if (!(participants === undefined) && participants.length > 0) {
        loader.loaderMessage.innerText = `Found ${participants.length} participants...`;

        for (const participant of participants) {
          try {
            await metadata.createMetadataParticipantFolder(analysisType, participant);
          } catch (error) {
            loader.toggle();

            const errorOverlay = new ErrorOverlay({
              message: `The application cannot initialize metadata tree for participants`,
              details: error.message,
              interact: true
            });

            errorOverlay.show();
            return;
          }
        }

        const messages = [
          `Initializing ${participants.length} participants...`,
          `It may take some times!`,
          `Hold on, we are working on it!`,
          `Almost there!`,
          `Just a few more steps`
        ];

        loader.loaderMessage.innerText = messages[0];
        const messageIndex = 1;

        setTimeout(() => {
          rollWaitingMessage(loader, messages, messageIndex);
        }, 3500);

        try {
          const request = await fetchParticipantIMUData(
            PathHelper.sanitizePath(dataFolderPathSession),
            analysisType,
            participants
          );

          const response = await request.json();

          if (!(response.code === 201)) {
            loader.toggle();

            const errorOverlay = new ErrorOverlay({
              message: response.payload.message,
              details: response.payload.details,
              interact: true
            });

            errorOverlay.show();
          } else {
            router.switchPage('participants-selection');
          }
        } catch (error) {
          const errorOverlay = new ErrorOverlay({
            message: `The application cannot fetch information of participants`,
            details: error.message,
            interact: true
          });

          errorOverlay.show();
        }
      } else {
        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `No participants could be found`,
          details: `please ensure that the HPF data has been converted properly`,
          interact: true,
          redirect: redirectConverter
        });

        errorOverlay.show();
      }
    }
  }
});
