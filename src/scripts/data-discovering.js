import '../styles/data-discovering.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { ErrorOverlay } from './components/error-overlay.js';
import { LoaderOverlay } from './components/loader-overlay.js';
import { Metadata } from './components/metadata.js';
import { PathHelper } from './helpers/path-helper.js';
import { Switch } from './utils/switch';
import { SessionStore } from './utils/session-store';
// import { Configuration } from './utils/configuration.js';

const os = nw.require('os');

const router = new Router();
router.disableBackButton();

// const configuration = await Configuration.load();

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

if ('data-path' in sessionStorage) {
  toggleFolderPath(sessionStorage.getItem('data-path'));
  submitButton.removeAttribute('disabled');
}

folderInput.addEventListener('change', event => {
  console.log({
    event
  });
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

      try {
        await metadata.checkBaseFolderContent();

        try {
          await metadata.createMetadataFolderTree();

          setTimeout(() => {
            router.switchPage('participants-selection');
          }, 1000);
        } catch (error) {
          loaderOverlay.toggle();

          const errorOverlay = new ErrorOverlay({
            message: `Application cannot initialize metadata folder tree`,
            details: error.message,
            interact: true
          });

          errorOverlay.show();
        }
      } catch (error) {
        loaderOverlay.toggle();

        const errorOverlay = new ErrorOverlay({
          message: error.message,
          details: `please ensure you have the three following folders with your data inside: ${metadata.getBaseContent.join(
            ', '
          )}`,
          interact: true
        });

        errorOverlay.show();
      }
    }
  }
});
