import '../styles/data-discovering.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';
import { ErrorOverlay } from './components/error-overlay.js';
import { Metadata } from './utils/metadata.js';
import { PathHelper } from './helpers/path-helper.js';
import { Switch } from './utils/switch';
import { SessionStore } from './utils/session-store';
import { Configuration } from './utils/configuration.js';
import { getAllParticipants } from './components/participants';

const os = nw.require('os');
const path = nw.require('path');

const router = new Router();
router.disableBackButton();

if ('app-error' in sessionStorage) {
  const { message, details } = JSON.parse(sessionStorage.getItem('app-error'));

  const errorOverlay = new ErrorOverlay({
    message,
    details
  });

  errorOverlay.show();
}

SessionStore.clear({ keep: ['data-path', 'analysis'] });

const loaderOverlay = new LoaderOverlay();
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
  return await fetch(`http://${configuration.HOST}:${configuration.PORT}/imu/`, {
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
  toggleFolderPath(sessionStorage.getItem('data-path'));
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

    if (!(sessionStorage.getItem('data-path') === null)) {
      sessionStorage.removeItem('data-path');
    }

    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  }
});

submitButton.addEventListener('click', async () => {
  if (!submitButton.disabled) {
    loaderOverlay.toggle({ message: 'Discovering data...' });

    if ('data-path' in sessionStorage) {
      const dataPath = sessionStorage.getItem('data-path');

      const sanitizedPath = PathHelper.sanitizePath(dataPath);
      const metadata = new Metadata(sanitizedPath);

      let isBaseFolderContentCompliant;

      try {
        isBaseFolderContentCompliant = await metadata.checkBaseFolderContent();
      } catch (error) {
        loaderOverlay.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `Cannot verify content of input data folder`,
          details: error.message,
          interact: true
        });

        errorOverlay.show();
      }

      let isMetadataFolderInit;

      if (isBaseFolderContentCompliant) {
        try {
          isMetadataFolderInit = await metadata.createMetadataFolderTree();
        } catch (error) {
          loaderOverlay.toggle();

          const errorOverlay = new ErrorOverlay({
            message: `Application cannot initialize the metadata tree`,
            details: error.message,
            interact: true
          });

          errorOverlay.show();
        }
      } else {
        loaderOverlay.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `Input data folder does not meet file structure requirements`,
          details: `please ensure you have the three following folders with your data inside: ${metadata.getBaseContent.join(
            ', '
          )}`,
          interact: true
        });

        errorOverlay.show();
      }

      const analysisType = sessionStorage.getItem('analysis');
      const dataFolderPathSession = sessionStorage.getItem('data-path');
      const analysisFolderPath = path.join(dataFolderPathSession, analysisType);
      let participants;

      if (isMetadataFolderInit) {
        participants = await getAllParticipants(
          PathHelper.sanitizePath(analysisFolderPath)
        );
      }

      let isMetadataParticipantsFolderCreated;

      if (!(participants === undefined)) {
        try {
          isMetadataParticipantsFolderCreated =
            await metadata.createMetadataParticipantFolder(analysisType, participants);
        } catch (error) {
          loaderOverlay.toggle();
          const errorOverlay = new ErrorOverlay({
            message: `Application cannot initialize metadata tree for participants`,
            details: error.message,
            interact: true
          });
          errorOverlay.show();
        }
      }

      if (isMetadataParticipantsFolderCreated) {
        try {
          const request = await fetchParticipantIMUData(
            PathHelper.sanitizePath(dataFolderPathSession),
            analysisType,
            participants
          );
          const response = await request.json();
          if (response.code === 201) {
            router.switchPage('participants-selection');
          } else {
            loaderOverlay.toggle();
            const errorOverlay = new ErrorOverlay({
              message: response.payload.message,
              details: response.payload.details,
              interact: true
            });
            errorOverlay.show();
          }
        } catch (error) {
          loaderOverlay.toggle();
          const errorOverlay = new ErrorOverlay({
            message: `Application cannot fetch information of participants`,
            details: error.message,
            interact: true
          });
          errorOverlay.show();
        }
      }
    }
  }
});
