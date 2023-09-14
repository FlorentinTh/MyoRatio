import '../styles/angles-preview.css';
import previewCard from '../views/partials/angles-preview/preview-card.hbs';

import Swal from 'sweetalert2';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Loader } from './components/loader.js';
import { getAllParticipants } from './utils/participants.js';
import { Metadata } from './app/metadata.js';
import { ErrorOverlay } from './components/overlay.js';
import { PathHelper } from './helpers/path-helper.js';
import { StringHelper } from './helpers/string-helper.js';
import { DOMElement } from './utils/dom-element.js';
import { FileHelper } from './helpers/file-helper.js';

const path = nw.require('path');

const router = new Router();
router.disableBackButton();

const loader = new Loader();

const menu = new Menu();
menu.init();

const dataFolderPathSession = PathHelper.sanitizePath(
  sessionStorage.getItem('data-path').toString().trim()
);
const analysisType = PathHelper.sanitizePath(
  sessionStorage.getItem('analysis').toString().toLowerCase().trim()
);

const analysisTitle = document.querySelector('.analysis h3');
const gridContainer = document.querySelector('.participant-card-container');
const submitButton = document.querySelector('button[type="submit"]');
const resetButton = document.querySelector('button[type="reset"]');

analysisTitle.innerText += ` ${analysisType}`;

const allComplexitiesSelected = [];

const participantsFolderPath = PathHelper.sanitizePath(
  path.join(dataFolderPathSession, 'Analysis', analysisType)
);
const participants = await getAllParticipants(participantsFolderPath, true);
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
      message: `Cannot find required files`,
      details: error.message,
      interact: true,
      redirect: 'data-discovering'
    });

    errorOverlay.show();
    return;
  }

  chartFiles = chartFiles.concat(
    files
      .filter(file => {
        const fileArray = file.split('.');

        if (fileArray[fileArray.length - 1] === 'png') {
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

const initInvalidSwitch = (invalidSwitch, card, onChange = false) => {
  if (onChange) {
    const autoSwitch = getAutoSwitches(card)[0];
    const complexityRadios = getComplexityRadios(card);

    if (invalidSwitch.checked) {
      for (const complexityRadio of complexityRadios) {
        if (autoSwitch.checked) {
          autoSwitch.checked = false;
        }

        autoSwitch.setAttribute('disabled', '');

        if (complexityRadio.checked) {
          complexityRadio.checked = false;
        }

        complexityRadio.setAttribute('disabled', '');
      }
    } else {
      autoSwitch.removeAttribute('disabled');

      for (const complexityRadio of complexityRadios) {
        complexityRadio.removeAttribute('disabled');
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

const getInvalidSwitches = card => {
  const autoSwitches = [...card.querySelector('.invalid').children];
  return autoSwitches.filter(item => item.nodeName === 'INPUT');
};

const saveData = async () => {
  const cards = gridContainer.children;

  for (const card of cards) {
    const participant = PathHelper.sanitizePath(
      card.querySelector('h3').innerText.toLowerCase()
    );
    const autoAngles = card.querySelector('.auto-switch').checked;
    const invalidParticipant = card.querySelector('.invalid-switch').checked;
    const complexityRadios = getComplexityRadios(card);

    let complexity = 'unknown';

    for (const complexityRadio of complexityRadios) {
      if (complexityRadio.checked) {
        complexity = complexityRadio.value.toLowerCase();
      }
    }

    try {
      await metadata.writeContent(analysisType, participant, {
        complexity,
        auto_angles: autoAngles,
        invalid: invalidParticipant
      });
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Information for participant ${participant} cannot be saved`,
        details: error.message,
        interact: true,
        redirect: 'participants-selection'
      });

      errorOverlay.show();
      return;
    }
  }
};

if (participants?.length > 0) {
  DOMElement.clear(gridContainer);

  for (let i = 0; i < participants.length; i++) {
    const participantName = StringHelper.formatParticipantName(participants[i]);

    let infos;

    try {
      infos = await metadata.getParticipantInfo(analysisType, participantName);
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Participant ${participants[i]} cannot be processed`,
        details: error.message,
        interact: true,
        redirect: 'data-discovering'
      });

      errorOverlay.show();
    }

    let currentChart = 0;

    const chartPath = await getChartFiles(participants[i]);
    displayPreviewCard(participantName, infos, chartPath[currentChart]);

    const card = gridContainer.children[i];

    const autoSwitches = getAutoSwitches(card);

    for (const autoSwitch of autoSwitches) {
      autoSwitch.addEventListener('change', event => {
        initAutoSwitch(autoSwitch, card, true);
      });
    }

    const invalidSwitches = getInvalidSwitches(card);

    for (const invalidSwitch of invalidSwitches) {
      invalidSwitch.addEventListener('change', event => {
        initInvalidSwitch(invalidSwitch, card, true);
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
  }
} else {
  const errorOverlay = new ErrorOverlay({
    message: `Error occurs while trying to retrieve participants`,
    details: `Received participants: ${participants}`,
    interact: true,
    redirect: 'data-discovering'
  });

  errorOverlay.show();
}

submitButton.addEventListener('click', async () => {
  if (!submitButton.disabled) {
    const cards = gridContainer.children;

    const notSelected = [];

    for (const card of cards) {
      const complexities = getComplexityRadios(card);
      let isSelected = false;

      for (const complexity of complexities) {
        if (complexity.checked || complexity.disabled) {
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
        title: `Missing ${complexityText}`,
        text: `${notSelected.length} ${complexityText} ${verbText} are not set`,
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
        confirmButtonText: `Set missing ${complexityText}`,
        denyButtonText: `Continue`
      })
        .then(async result => {
          if (!result.isConfirmed) {
            loader.toggle({ message: 'Saving data...' });

            await saveData();

            setTimeout(() => {
              router.switchPage('participants-selection');
            }, 800);
          } else {
            Swal.close();
          }
        })
        .catch(error => {
          throw new Error(error);
        });
    } else {
      loader.toggle({ message: 'Saving data...' });

      await saveData();

      setTimeout(() => {
        router.switchPage('participants-selection');
      }, 800);
    }
  }
});

resetButton.addEventListener('click', event => {
  router.switchPage('participants-selection');
});
