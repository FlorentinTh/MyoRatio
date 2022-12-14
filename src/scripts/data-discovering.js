import '../styles/data-discovering.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { ErrorOverlay } from './components/error-overlay.js';
import { LoaderOverlay } from './components/loader-overlay.js';

// eslint-disable-next-line no-undef
const os = nw.require('os');

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

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();
menu.init();

const folderInput = document.querySelector('.folder-input');
const dropArea = document.querySelector('.folder-drop-area');
const chooseButton = document.querySelector('.choose-btn');
const folderMessage = document.querySelector('.folder-msg');

folderInput.setAttribute('nwworkingdir', os.homedir());

const storedAnalysis = sessionStorage.getItem('analysis');
let analysisTypeRadios = [...document.querySelector('.switch').children];
analysisTypeRadios = analysisTypeRadios.filter(item => item.nodeName === 'INPUT');

if (storedAnalysis === null) {
  sessionStorage.setItem('analysis', analysisTypeRadios[0].value);
  analysisTypeRadios[0].checked = true;
} else {
  for (const analysisTypeRadio of analysisTypeRadios) {
    if (analysisTypeRadio.value === storedAnalysis) {
      analysisTypeRadio.checked = true;
    }
  }
}

for (const analysisTypeRadio of analysisTypeRadios) {
  analysisTypeRadio.addEventListener('change', event => {
    sessionStorage.setItem('analysis', analysisTypeRadio.value);
  });
}

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

const windowSizeInput = document.getElementById('window-size');

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

const submitButton = document.querySelector('button[type="submit"]');

windowSizeInput.addEventListener('input', event => {
  const value = event.target.value;

  if (!(value === '') && value > 0) {
    if (submitButton.disabled && folderInput.files.length > 0) {
      submitButton.removeAttribute('disabled');
    }
  } else {
    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  }
});

folderInput.addEventListener('change', event => {
  if (event && event.target.files.length > 0) {
    const folder = event.target.files[0];

    toggleFolderPath(folder.path);
    sessionStorage.setItem('data-path', folder.path);

    if (
      submitButton.disabled &&
      !(windowSizeInput.value === '') &&
      windowSizeInput.value > 0
    ) {
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

submitButton.addEventListener('click', () => {
  if (!submitButton.disabled) {
    loaderOverlay.toggle({ message: 'Discovering data...' });

    setTimeout(() => {
      router.switchPage('participants-selection');
    }, 2000);
  }
});
