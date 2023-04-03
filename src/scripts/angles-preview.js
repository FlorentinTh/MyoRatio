import '../styles/angles-preview.css';
import previewCard from '../views/partials/angles-preview/preview-card.hbs';

import Swal from 'sweetalert2';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { getAllParticipants } from './components/participants';
import { Metadata } from './utils/metadata.js';
import { LoaderOverlay } from './components/loader-overlay.js';
import { ErrorOverlay } from './components/overlay';
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

const dataFolderPathSession = sessionStorage.getItem('data-path').toString();
const analysisType = sessionStorage.getItem('analysis').toString();

const analysisTitle = document.querySelector('.analysis h3');
const gridContainer = document.querySelector('.participant-card-container');
const submitButton = document.querySelector('button[type="submit"]');

analysisTitle.innerText += ` ${analysisType}`;

const allComplexitiesSelected = [];

const participantsFolderPath = PathHelper.sanitizePath(
  path.join(dataFolderPathSession, 'analysis', analysisType)
);
const participants = await getAllParticipants(participantsFolderPath);
const metadata = new Metadata(dataFolderPathSession);

const displayPreviewCard = (participant, infos, chart) => {
  gridContainer.insertAdjacentHTML(
    'beforeend',
    previewCard({ participant, infos, chart })
  );
};

const getChartFiles = async participant => {
  const inputPath = path.join(participantsFolderPath, participant);

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

const getNavButtons = card => {
  return [...card.querySelectorAll('.nav-btn-container .icon-container')];
};

const initAutoSwitch = (autoSwitch, card, onChange = false) => {
  if (onChange) {
    const complexityRadios = getComplexityRadios(card);
    let isRadioSelected = false;

    if (autoSwitch.checked) {
      let lowComplexity;

      for (const complexityRadio of complexityRadios) {
        if (complexityRadio.value.toLowerCase() === 'low') {
          lowComplexity = complexityRadio;
        }

        if (complexityRadio.checked) {
          isRadioSelected = true;
        }
      }

      if (!isRadioSelected) {
        lowComplexity.checked = true;

        if (!allComplexitiesSelected.includes(lowComplexity.name)) {
          allComplexitiesSelected.push(lowComplexity.name);
        }
      }
    }
  }
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

const getComplexityRadios = card => {
  const complexityRadios = [...card.querySelector('.switch').children];
  return complexityRadios.filter(item => item.nodeName === 'INPUT');
};

const getAutoSwitches = card => {
  const autoSwitches = [...card.querySelector('.angle-auto-select').children];
  return autoSwitches.filter(item => item.nodeName === 'INPUT');
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

      const autoSwitches = getAutoSwitches(card);

      for (const autoSwitch of autoSwitches) {
        autoSwitch.addEventListener('change', event => {
          initAutoSwitch(autoSwitch, card, true);
        });
      }

      const complexityRadios = getComplexityRadios(card);

      for (const complexityRadio of complexityRadios) {
        initComplexityRadio(complexityRadio, card);

        complexityRadio.addEventListener('change', event => {
          initComplexityRadio(complexityRadio, card, true);
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

    const cards = gridContainer.children;

    const notSelected = [];

    for (const card of cards) {
      const complexities = getComplexityRadios(card);
      let isSelected = false;

      for (const complexity of complexities) {
        if (complexity.checked) {
          isSelected = true;
        }
      }

      if (!isSelected) {
        notSelected.push(card);
      }
    }

    if (notSelected.length > 0 && notSelected.length <= cards.length) {
      const complexityText = notSelected.length > 1 ? `complexities` : `complexity`;
      const verbText = notSelected.length > 1 ? `are` : `is`;

      Swal.fire({
        title: 'Missing complexities',
        text: `${notSelected.length} ${complexityText} ${verbText} not set`,
        icon: 'info',
        background: '#ededed',
        customClass: {
          confirmButton: 'button-popup confirm',
          denyButton: 'button-popup cancel'
        },
        buttonsStyling: false,
        padding: '0 0 35px 0',
        allowOutsideClick: false,
        showCancelButton: false,
        showDenyButton: true,
        confirmButtonText: `Set remaining ${complexityText}`,
        denyButtonText: `Continue`
      })
        .then(async result => {
          if (!result.isConfirmed) {
            await saveData();

            setTimeout(() => {
              router.switchPage('participants-selection');
            }, 1000);
          } else {
            loaderOverlay.toggle();
          }
        })
        .catch(error => {
          throw new Error(error);
        });
    } else {
      await saveData();

      setTimeout(() => {
        router.switchPage('participants-selection');
      }, 1000);
    }
  }
});
