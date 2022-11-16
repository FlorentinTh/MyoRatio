import LoaderOverlay from './components/loader-overlay.js';
import Menu from './components/menu.js';
import Router from './utils/router.js';

// eslint-disable-next-line no-undef
const os = nw.require('os');

const menu = new Menu();
menu.init();

const folderInput = document.querySelector('.folder-input');
const dropArea = document.querySelector('.folder-drop-area');
const chooseBtn = document.querySelector('.choose-btn');
const folderMsg = document.querySelector('.folder-msg');

folderInput.setAttribute('nwworkingdir', os.homedir());

const storedAnalysis = sessionStorage.getItem('analysis');
let radios = [...document.querySelector('.switch').children];
radios = radios.filter(item => item.nodeName === 'INPUT');

if (storedAnalysis === null) {
  sessionStorage.setItem('analysis', radios[0].value);
  radios[0].checked = true;
} else {
  for (const radio of radios) {
    if (radio.value === storedAnalysis) {
      radio.checked = true;
    }
  }
}

for (const radio of radios) {
  radio.addEventListener('change', event => {
    sessionStorage.setItem('analysis', radio.value);
  });
}

function toggleDropAreaActive() {
  dropArea.classList.toggle('is-active');
  chooseBtn.classList.toggle('is-active');
  folderMsg.classList.toggle('is-active');
}

folderInput.addEventListener('dragenter', () => {
  toggleDropAreaActive();
});

folderInput.addEventListener('dragleave', () => {
  toggleDropAreaActive();
});

folderInput.addEventListener('drop', () => {
  toggleDropAreaActive();
});

const submitBtn = document.querySelector('button[type="submit"]');
const windowSizeInput = document.getElementById('window-size');

windowSizeInput.addEventListener('input', event => {
  const value = event.target.value;

  if (!(value === '') && value > 0) {
    if (submitBtn.disabled && folderInput.files.length > 0) {
      submitBtn.removeAttribute('disabled');
    }
  } else {
    if (!submitBtn.disabled) {
      submitBtn.setAttribute('disabled', '');
    }
  }
});

const dataFolderPathSession = sessionStorage.getItem('data-path');

if (!(dataFolderPathSession === null)) {
  folderMsg.innerHTML = `selected folder path is <br> ${dataFolderPathSession}`;
  if (submitBtn.disabled) {
    submitBtn.removeAttribute('disabled');
  }
}

folderInput.addEventListener('change', event => {
  if (event && event.target.files.length > 0) {
    const folder = event.target.files[0];

    folderMsg.innerHTML = `selected folder path is <br> ${folder.path}`;
    sessionStorage.setItem('data-path', folder.path);

    if (
      submitBtn.disabled &&
      !(windowSizeInput.value === '') &&
      windowSizeInput.value > 0
    ) {
      submitBtn.removeAttribute('disabled');
    }
  } else {
    folderMsg.innerHTML = `or drag and drop the folder here`;

    if (!(dataFolderPathSession === null)) {
      sessionStorage.removeItem('data-path');
    }

    if (!submitBtn.disabled) {
      submitBtn.setAttribute('disabled', '');
    }
  }
});

submitBtn.addEventListener('click', () => {
  if (!submitBtn.disabled) {
    LoaderOverlay.toggle();

    setTimeout(() => {
      Router.switchPage('participants-selection.html');
    }, 2000);
  }
});
