import LoaderOverlay from './components/loader-overlay.js';
import Menu from './components/menu.js';
import Router from './utils/router.js';

Router.disableBackButton();

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

function toggleFolderPath(path = null) {
  if (!(folderMsg.querySelector('.folder-path') === null)) {
    folderMsg.querySelector('.folder-path').remove();
  }

  if (path === null) {
    folderMsg.querySelector('#text').innerHTML = `or drag and drop the folder here`;
  } else {
    folderMsg.querySelector('#text').innerHTML = `selected folder path is`;

    const folderPathDiv = document.createElement('div');
    folderPathDiv.classList.add('folder-path');
    const pathElements = path.split('\\');

    for (let i = 1; i <= pathElements.length; i++) {
      const element = pathElements[i - 1];

      const folderSpan = document.createElement('span');
      folderSpan.classList.add('folder');
      folderSpan.appendChild(document.createTextNode(element));
      folderPathDiv.appendChild(folderSpan);

      if (i < pathElements.length) {
        const separatorSpan = document.createElement('span');
        separatorSpan.classList.add('separator');
        separatorSpan.appendChild(document.createTextNode('\\'));
        folderPathDiv.appendChild(separatorSpan);

        folderMsg.appendChild(folderPathDiv);
      }
    }
  }
}

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
  toggleFolderPath(dataFolderPathSession);
  if (submitBtn.disabled) {
    submitBtn.removeAttribute('disabled');
  }
}

folderInput.addEventListener('change', event => {
  if (event && event.target.files.length > 0) {
    const folder = event.target.files[0];

    toggleFolderPath(folder.path);
    sessionStorage.setItem('data-path', folder.path);

    if (
      submitBtn.disabled &&
      !(windowSizeInput.value === '') &&
      windowSizeInput.value > 0
    ) {
      submitBtn.removeAttribute('disabled');
    }
  } else {
    toggleFolderPath();

    if (!(sessionStorage.getItem('data-path') === null)) {
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
