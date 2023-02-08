import '../styles/angles-preview.css';
import previewCard from '../views/partials/angles-preview/preview-card.hbs';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { getAllParticipants } from './components/participants';
import { Metadata } from './utils/metadata.js';
import { LoaderOverlay } from './components/loader-overlay.js';
import { ErrorOverlay } from './components/error-overlay';
import { PathHelper } from './helpers/path-helper';
import { StringHelper } from './helpers/string-helper';
import { DOMElement } from './utils/dom-element.js';
import { FileHelper } from './helpers/file-helper';

const path = nw.require('path');

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();
menu.init();

const dataFolderPathSession = sessionStorage.getItem('data-path');
const analysisType = sessionStorage.getItem('analysis');

const analysisTitle = document.querySelector('.analysis h3');
const gridContainer = document.querySelector('.participant-card-container');
const submitButton = document.querySelector('button[type="submit"]');
const resetButton = document.querySelector('button[type="reset"]');

analysisTitle.innerText += ` ${analysisType}`;

const allComplexitiesSelected = [];

const participantsFolderPath = path.join(dataFolderPathSession, 'analysis', analysisType);
const sanitizedParticipantsFolderPath = PathHelper.sanitizePath(participantsFolderPath);
const participants = await getAllParticipants(sanitizedParticipantsFolderPath);
const metadata = new Metadata(dataFolderPathSession);

const displayPreviewCard = (participant, infos, chart) => {
  gridContainer.insertAdjacentHTML(
    'beforeend',
    previewCard({ participant, infos, chart })
  );
};

const getChartFiles = async participant => {
  const inputPath = path.join(sanitizedParticipantsFolderPath, participant);

  let chartFiles = [];

  let files;
  try {
    files = await FileHelper.listAllFiles(inputPath);
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Cannot find chart files`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  chartFiles = chartFiles.concat(
    files
      .filter(file => {
        const fileArray = file.split('.');

        if (fileArray[fileArray.length - 1] === 'svg') {
          const fileArray = file.split('_');

          if (fileArray.includes('plot')) {
            return true;
          }
        }

        return false;
      })
      .map(file => path.join('file://', inputPath, file))
  );

  return chartFiles;
};

const initComplexityRadio = (complexityRadio, card, onChange = false) => {
  if (complexityRadio.checked) {
    if (onChange) {
      if (complexityRadio.value.toLowerCase() === 'low') {
        if (!card.querySelector('.auto-switch').checked) {
          card.querySelector('.auto-switch').checked = true;
        }
      } else {
        if (card.querySelector('.auto-switch').checked) {
          card.querySelector('.auto-switch').checked = false;
        }
      }
    }

    if (!allComplexitiesSelected.includes(complexityRadio.name)) {
      allComplexitiesSelected.push(complexityRadio.name);
    }
  }
};

const checkAllComplexitiesSelected = () => {
  if (allComplexitiesSelected.length < gridContainer.children.length) {
    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  } else {
    if (submitButton.disabled) {
      submitButton.removeAttribute('disabled');
    }
  }
};

const getComplexityRadios = card => {
  const complexityRadios = [...card.querySelector('.switch').children];
  return complexityRadios.filter(item => item.nodeName === 'INPUT');
};

const getNavButtons = card => {
  return [...card.querySelectorAll('.nav-btn-container .icon-container')];
};

const saveData = async () => {
  const cards = gridContainer.children;
  for (const card of cards) {
    const participant = card.querySelector('h3').innerText.toLowerCase();
    const autoAngles = card.querySelector('.auto-switch').checked;
    const complexityRadios = getComplexityRadios(card);

    let complexity;

    for (const complexityRadio of complexityRadios) {
      if (complexityRadio.checked) {
        complexity = complexityRadio.value.toLowerCase();
      }
    }

    try {
      await metadata.writeContent(analysisType, participant, {
        complexity,
        auto_angles: autoAngles
      });
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Information for participant ${participant} cannot be saved`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }
  }
};

if (participants?.length > 0) {
  setTimeout(() => {
    DOMElement.clear(gridContainer);
  }, 500);

  for (let i = 0; i < participants.length; i++) {
    const participantName = StringHelper.formatParticipantName(participants[i]);

    let infos;
    try {
      infos = await metadata.getParticipantInfo(
        PathHelper.sanitizePath(analysisType),
        participantName
      );
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Participant ${participants[i]} cannot be processed`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }

    let currentChart = 0;

    setTimeout(async () => {
      const chartPath = await getChartFiles(participants[i]);
      displayPreviewCard(participantName, infos, chartPath[currentChart]);

      const card = gridContainer.children[i];
      const complexityRadios = getComplexityRadios(card);

      for (const complexityRadio of complexityRadios) {
        initComplexityRadio(complexityRadio, card);

        complexityRadio.addEventListener('change', event => {
          initComplexityRadio(complexityRadio, card, true);
          checkAllComplexitiesSelected();
        });
      }

      const navButtons = getNavButtons(card);
      for (const navButton of navButtons) {
        navButton.addEventListener('click', event => {
          if (navButton.parentElement.classList.contains('nav-next')) {
            if (currentChart === 0) {
              card.querySelector('.nav-prev').children[0].classList.remove('disabled');
            }

            currentChart++;

            if (currentChart === chartPath.length - 1) {
              navButton.classList.add('disabled');
            }
          } else {
            if (currentChart === chartPath.length - 1) {
              card.querySelector('.nav-next').children[0].classList.remove('disabled');
            }

            currentChart--;

            if (currentChart === 0) {
              navButton.classList.add('disabled');
            }
          }

          card.querySelector('img').src = chartPath[currentChart];
        });
      }

      checkAllComplexitiesSelected();
    }, 500);
  }
} else {
  const errorOverlay = new ErrorOverlay({
    message: `Error occurs while trying to retrieve participants`,
    details: `Received participants: ${participants}`,
    interact: true
  });

  errorOverlay.show();
}

submitButton.addEventListener('click', async () => {
  if (!submitButton.disabled) {
    loaderOverlay.toggle({ message: 'Saving data...' });

    await saveData();

    setTimeout(() => {
      router.switchPage('participants-selection');
    }, 1000);
  }
});

resetButton.addEventListener('click', () => {
  router.switchPage('participants-selection');
});
