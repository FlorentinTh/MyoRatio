import '../styles/participants-selection.css';
// eslint-disable-next-line max-len
import stageSelectorTemplate from '../views/partials/participants-selection/stage-selector.hbs';
import participantCard from '../views/partials/participants-list/participant-card.hbs';
import emptyCard from '../views/partials/participants-list/empty-card.hbs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import Swal from 'sweetalert2';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Loader } from './components/loader.js';
import { ErrorOverlay } from './components/overlay';
import { getAllParticipants } from './utils/participants';
import { Metadata } from './utils/metadata.js';
import { PathHelper } from './helpers/path-helper.js';
import { StringHelper } from './helpers/string-helper';
import { Switch } from './utils/switch';
import { DOMElement } from './utils/dom-element';
import { SessionStore } from './utils/session-store';
import { Configuration } from './utils/configuration.js';
import { FileHelper } from './helpers/file-helper';

const path = nw.require('path');
const fs = nw.require('fs');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Toronto');

const loader = new Loader();
const configuration = await Configuration.load();

const router = new Router();
router.disableBackButton();

const menu = new Menu();

const additionalMenuButtons = document.querySelectorAll('[class^="export-"]');
menu.init(additionalMenuButtons);

const dataFolderPathSession = sessionStorage.getItem('data-path').toString();
const analysisType = PathHelper.sanitizePath(
  sessionStorage.getItem('analysis').toString()
);

const changeButton = document.getElementById('change-btn');
// const exportPDFButton = document.querySelector('.export-pdf-btn');
const exportXLSXButton = document.querySelector('.export-xlsx-btn');
const dataPath = document.getElementById('data-path');
const analysisTitle = document.querySelector('.analysis h3');
const previewButton = document.getElementById('btn-preview');
const selectButtonAll = document.getElementById('btn-all');
const selectButtonNotCompleted = document.getElementById('btn-not-completed');
const submitButton = document.querySelector('button[type="submit"]');
const stageSelector = document.getElementById('stage-selector');
const participantsList = document.querySelector('ul.list');

dataPath.querySelector('p').innerText = ` ${
  sessionStorage.getItem('data-path').toString() || 'ERROR'
}`;

analysisTitle.innerText += ` ${analysisType}`;

const analysisFolderPath = PathHelper.sanitizePath(
  path.join(dataFolderPathSession, 'Analysis', analysisType)
);
const participants = await getAllParticipants(analysisFolderPath);
const metadata = new Metadata(dataFolderPathSession);

const displayStageSelector = analysis => {
  stageSelector.insertAdjacentHTML('afterbegin', stageSelectorTemplate({ analysis }));
};

displayStageSelector(analysisType);

const stageSwitchRadios = Switch.init('stage');

const participantsArray = [];
let selectedParticipants = [];

let stage =
  sessionStorage.getItem('stage') === undefined
    ? 'concentric'
    : sessionStorage.getItem('stage');

let participantItems;
let isAllSelected = false;
let isAllNotCompletedSelected = false;
let totalInvalid = 0;
let totalCompleted = 0;

const displayEmptyCard = () => {
  previewButton.setAttribute('disabled', '');
  selectButtonAll.setAttribute('disabled', '');
  selectButtonNotCompleted.setAttribute('disabled', '');

  for (const stageSwitchRadio of stageSwitchRadios) {
    stageSwitchRadio.setAttribute('disabled', '');

    if (stageSwitchRadio.checked) {
      stageSwitchRadio.checked = false;
    }
  }

  if ('stage' in sessionStorage) {
    sessionStorage.removeItem('stage');
  }

  participantsList.insertAdjacentHTML('afterbegin', emptyCard());
};

const displayParticipantCard = (participant, infos, stage) => {
  participantsList.insertAdjacentHTML(
    'afterbegin',
    participantCard({ participant, infos, stage })
  );
};

const renderParticipantsList = async () => {
  for (const participant of participants) {
    const participantName = StringHelper.formatParticipantName(participant);

    let infos;

    try {
      infos = await metadata.getParticipantInfo(analysisType, participantName);
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Participant ${participant} cannot be processed`,
        details: error.message,
        interact: true,
        redirect: 'data-discovering'
      });

      errorOverlay.show();
      return;
    }

    const index = participantsArray.findIndex(e => e.name === participant);

    if (index > -1) {
      participantsArray[index] = {
        ...participantsArray[index],
        ...{
          name: participant,
          infos
        }
      };
    } else {
      participantsArray.push({
        name: participant,
        infos
      });
    }

    const stage = sessionStorage.getItem('stage').toString();
    displayParticipantCard(participantName, infos, infos.stages[stage]);
  }
};

const toggleSubmitButton = () => {
  if (selectedParticipants.length > 0) {
    if (submitButton.disabled) {
      submitButton.removeAttribute('disabled');
    }
  } else {
    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  }
};

const toggleSelectedParticipantStorage = () => {
  if (selectedParticipants.length > 0) {
    sessionStorage.setItem('selected-participants', selectedParticipants.join(','));
  } else {
    sessionStorage.removeItem('selected-participants');
  }
};

const disableNotRequiredButton = total => {
  if (total === participants.length - totalInvalid) {
    selectButtonNotCompleted.setAttribute('disabled', '');
  } else if (!(total > 0)) {
    selectButtonAll.setAttribute('disabled', '');
  }
};

const selectParticipant = participantItem => {
  const participantName = participantItem
    .querySelector('.line-1 > span.name')
    .innerText.toLowerCase();
  selectedParticipants.push(participantName.trim());
  participantItem.classList.toggle('selected');
};

const toggleSelectButtons = (selected, total, all = true) => {
  if (all) {
    const baseText = 'All';
    selectButtonAll.innerText = selected ? `Unselect ${baseText}` : baseText;
    isAllSelected = selected;
  } else {
    const baseText = 'Not Completed';
    selectButtonNotCompleted.innerText = selected ? `Unselect ${baseText}` : baseText;
    isAllNotCompletedSelected = selected;
  }

  if (selected) {
    if (all) {
      selectButtonNotCompleted.setAttribute('disabled', '');
    } else {
      selectButtonAll.setAttribute('disabled', '');
    }
  } else {
    if (all) {
      selectButtonNotCompleted.removeAttribute('disabled');
    } else {
      selectButtonAll.removeAttribute('disabled');
    }
  }

  disableNotRequiredButton(total);
};

const resetSelectButtons = () => {
  selectButtonAll.innerText = 'All';
  selectButtonNotCompleted.innerText = 'Not Completed';

  isAllSelected = false;
  isAllNotCompletedSelected = false;

  selectButtonNotCompleted.removeAttribute('disabled');
  selectButtonAll.removeAttribute('disabled');

  if (!(totalCompleted > 0)) {
    selectButtonAll.setAttribute('disabled', '');
  }

  if (totalCompleted + totalInvalid === participants.length) {
    selectButtonNotCompleted.setAttribute('disabled', '');
  }
};

const checkSelectedParticipantsAllNotCompleted = () => {
  let totalNotCompleted = 0;
  let totalNotCompletedSelected = 0;

  for (const participantItem of participantItems) {
    const participantItemClasses = participantItem.classList;

    if (participantItemClasses.contains('not-completed')) {
      if (participantItemClasses.contains('selected')) {
        totalNotCompletedSelected++;
      }

      totalNotCompleted++;
    }
  }

  if (totalNotCompleted > 0) {
    if (totalNotCompleted === totalNotCompletedSelected) {
      toggleSelectButtons(true, totalCompleted, false);
    }
  }

  return totalNotCompleted;
};

const exportResultsRequests = async () => {
  loader.toggle({ message: 'Writing reports...' });

  try {
    const request = await fetchXLSXReport();
    const response = await request.json();
    loader.toggle();

    if (!(response.code === 201)) {
      const errorOverlay = new ErrorOverlay({
        message: response.payload.message,
        details: response.payload.details,
        interact: true
      });

      errorOverlay.show();
      return;
    } else {
      loader.toggle({ message: 'Compiling results...' });

      try {
        const request = await fetchXLSXSummary();
        const response = await request.json();

        loader.toggle();

        if (!(response.code === 201)) {
          const errorOverlay = new ErrorOverlay({
            message: response.payload.message,
            details: response.payload.details,
            interact: true
          });

          errorOverlay.show();
          return;
        }
      } catch (error) {
        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `The application cannot produce the results summary`,
          details: error.message,
          interact: true
        });

        errorOverlay.show();
      }
    }
  } catch (error) {
    loader.toggle();

    const errorOverlay = new ErrorOverlay({
      message: `The application cannot produce XLSX reports`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }
};

const xlsxExportButtonClickHandler = async () => {
  let stageFolderName = StringHelper.capitalize(stage);

  if (analysisType === 'sit-stand') {
    stageFolderName = stage === 'concentric' ? 'Standing' : 'Sitting';
  }

  const resultFolderPath = path.join(
    PathHelper.sanitizePath(dataFolderPathSession),
    'Results',
    StringHelper.capitalize(analysisType),
    stageFolderName
  );

  try {
    await FileHelper.createFileOrDirectoryIfNotExists(resultFolderPath);
  } catch (error) {
    loader.toggle();

    const errorOverlay = new ErrorOverlay({
      message: `The application cannot initialize the participants' export information`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
    return;
  }

  let files;

  try {
    files = await FileHelper.listAllFiles(resultFolderPath);
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

  if (files.length > 0) {
    Swal.fire({
      title: `Files already exist`,
      text: `Reports for the ${stageFolderName.toLowerCase()} stage of the ${analysisType} analysis have already been created. By proceeding, all files will be overwritten`,
      icon: 'warning',
      background: '#ededed',
      customClass: {
        confirmButton: 'button-popup confirm',
        cancelButton: 'button-popup cancel'
      },
      buttonsStyling: false,
      padding: '0 0 35px 0',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: 'Yes, overwrite!'
    })
      .then(async result => {
        if (result.isConfirmed) {
          await exportResultsRequests();
        }
      })
      .catch(error => {
        throw new Error(error);
      });
  } else {
    await exportResultsRequests();
  }
};

const initCard = items => {
  if ('selected-participants' in sessionStorage) {
    selectedParticipants = sessionStorage
      .getItem('selected-participants')
      .toString()
      .split(',');
  }

  toggleSubmitButton();

  for (const participantItem of items) {
    if (participantItem.classList.contains('completed')) {
      totalCompleted++;
    } else if (participantItem.classList.contains('invalid')) {
      totalInvalid++;
    }

    const participantName = participantItem
      .querySelector('.line-1 > span.name')
      .innerText.toLowerCase();

    if (
      selectedParticipants.length > 0 &&
      selectedParticipants.includes(participantName)
    ) {
      participantItem.classList.toggle('selected');

      const totalNotCompletedParticipant = checkSelectedParticipantsAllNotCompleted();

      if (totalNotCompletedParticipant < selectedParticipants.length - totalInvalid) {
        if (participants.length === selectedParticipants.length) {
          resetSelectButtons();
          toggleSelectButtons(true, totalCompleted);
        }
      }
    }

    participantItem.querySelector('.content').addEventListener('click', () => {
      const isInvalid = participantItem.querySelector('.infos:has(.invalid)');

      if (isInvalid === null) {
        if (participantItem.classList.contains('selected')) {
          selectedParticipants = selectedParticipants.filter(
            participant => participant !== participantName.trim()
          );

          resetSelectButtons();
          participantItem.classList.toggle('selected');
          checkSelectedParticipantsAllNotCompleted();
        } else {
          selectedParticipants.push(participantName.trim());
          participantItem.classList.toggle('selected');
          checkSelectedParticipantsAllNotCompleted();
        }

        if (participants.length === selectedParticipants.length) {
          resetSelectButtons();
          toggleSelectButtons(true, totalCompleted);
        }

        toggleSubmitButton();
        toggleSelectedParticipantStorage();
      }
    });

    const resultsButton = participantItem.querySelector('.actions > button#results');

    if (!(resultsButton === null)) {
      resultsButton.addEventListener('click', () => {
        sessionStorage.setItem('participant-result', participantName.trim());
        router.switchPage('results');
      });
    }
  }

  resetSelectButtons();
  disableNotRequiredButton(totalCompleted);

  if (!(totalCompleted > 0)) {
    exportXLSXButton.classList.add('export-btn-disabled');
    exportXLSXButton.removeEventListener('click', xlsxExportButtonClickHandler);
  } else {
    exportXLSXButton.classList.remove('export-btn-disabled');
    exportXLSXButton.addEventListener('click', xlsxExportButtonClickHandler);
  }
};

const fetchXLSXReport = async () => {
  const port = localStorage.getItem('port') ?? configuration.PORT;

  return await fetch(`http://${configuration.HOST}:${port}/api/report/xlsx`, {
    headers: {
      'X-API-Key': configuration.API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      data_path: PathHelper.sanitizePath(dataFolderPathSession),
      analysis: analysisType,
      stage
    })
  });
};

const fetchXLSXSummary = async () => {
  const port = localStorage.getItem('port') ?? configuration.PORT;

  return await fetch(`http://${configuration.HOST}:${port}/api/summary`, {
    headers: {
      'X-API-Key': configuration.API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      data_path: PathHelper.sanitizePath(dataFolderPathSession),
      analysis: analysisType,
      stage
    })
  });
};

const mutexLock = async () => {
  const firstParticipant = StringHelper.revertParticipantNameFromSession(
    selectedParticipants[0]
  );

  const firstParticipantMetadataPath = await metadata.getParticipantFolderPath(
    analysisType,
    selectedParticipants[0],
    { fromSession: true }
  );

  const metadataRootPath = path.parse(firstParticipantMetadataPath).dir;

  try {
    await fs.promises.access(
      path.join(metadataRootPath, `${firstParticipant}.lock`),
      fs.constants.F_OK
    );

    loader.toggle();

    const errorOverlay = new ErrorOverlay({
      message: `Participant ${firstParticipant} cannot be processed`,
      details: `Another user is currently processing the participant ${firstParticipant}. Please try again later or remove this participant from your selection`,
      interact: true
    });

    errorOverlay.show();
    return;
  } catch (error) {
    try {
      await fs.promises.writeFile(
        PathHelper.sanitizePath(path.join(metadataRootPath, `${firstParticipant}.lock`)),
        ''
      );
      setTimeout(() => {
        router.switchPage('angles-selection');
      }, 800);
    } catch (error) {
      loader.toggle();

      const errorOverlay = new ErrorOverlay({
        message: `Participant ${firstParticipant} cannot be processed`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }
  }
};

if (!(participants?.length > 0)) {
  participantsList.classList.add('empty');
  displayEmptyCard();
} else {
  participantItems = document.querySelector('ul.list').children;

  try {
    await metadata.cleanParticipantMetadata(analysisType, participants);
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Cannot retrieve participants' information`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  await renderParticipantsList();

  for (const stageSwitchRadio of stageSwitchRadios) {
    stageSwitchRadio.addEventListener('change', async event => {
      stage = stageSwitchRadio.value;

      DOMElement.clear(participantsList);
      participantsList.parentElement.classList.add('change');

      setTimeout(async () => {
        selectedParticipants = [];
        isAllSelected = false;
        isAllNotCompletedSelected = false;
        totalCompleted = 0;
        totalInvalid = 0;
        toggleSelectedParticipantStorage();
        await renderParticipantsList();
        toggleSubmitButton();
        initCard(participantItems);
        participantsList.parentElement.classList.remove('change');
      }, 200);
    });
  }

  initCard(participantItems);

  previewButton.addEventListener('click', () => {
    if (!previewButton.disabled) {
      router.switchPage('angles-preview');
    }
  });

  selectButtonAll.addEventListener('click', () => {
    if (!isAllSelected) {
      for (const participantItem of participantItems) {
        const isInvalid = participantItem.querySelector('.infos:has(.invalid)');

        if (isInvalid === null) {
          if (!participantItem.classList.contains('selected')) {
            selectParticipant(participantItem);
          }
        }
      }

      toggleSelectButtons(true, totalCompleted);
    } else {
      for (const participantItem of participantItems) {
        const isInvalid = participantItem.querySelector('.infos:has(.invalid)');

        if (isInvalid === null) {
          participantItem.classList.toggle('selected');
          selectedParticipants.pop();
        }
      }

      toggleSelectButtons(false, totalCompleted);
    }

    toggleSubmitButton();
    toggleSelectedParticipantStorage();
  });

  selectButtonNotCompleted.addEventListener('click', () => {
    if (!isAllNotCompletedSelected) {
      for (const participantItem of participantItems) {
        const isInvalid = participantItem.querySelector('.infos:has(.invalid)');

        if (isInvalid === null) {
          const participantItemClasses = participantItem.classList;

          if (participantItemClasses.contains('selected')) {
            if (!participantItemClasses.contains('not-completed')) {
              participantItem.classList.toggle('selected');
              const participantName = participantItem
                .querySelector('.line-1 > span.name')
                .innerText.toLowerCase();

              selectedParticipants = selectedParticipants.filter(
                participant => participant !== participantName.trim()
              );
            }
          } else {
            if (participantItemClasses.contains('not-completed')) {
              selectParticipant(participantItem);
            }
          }
        }
      }

      toggleSelectButtons(true, totalCompleted, false);
    } else {
      for (const participantItem of participantItems) {
        const participantItemClasses = participantItem.classList;

        if (
          participantItemClasses.contains('not-completed') &&
          participantItemClasses.contains('selected')
        ) {
          participantItem.classList.toggle('selected');
          selectedParticipants.pop();
        }
      }

      toggleSelectButtons(false, totalCompleted, false);
    }

    toggleSubmitButton();
    toggleSelectedParticipantStorage();
  });

  submitButton.addEventListener('click', async () => {
    if (!submitButton.disabled) {
      const selectedItems = participantsList.querySelectorAll('.selected');
      const complexityNotSet = [];

      for (const selectedItem of selectedItems) {
        if (
          selectedItem.querySelector('.infos').children[2].classList.contains('unknown')
        ) {
          complexityNotSet.push(selectedItem);
        }
      }

      if (complexityNotSet.length > 0) {
        const participantText =
          complexityNotSet.length > 1 ? `participants` : `participant`;

        const complexityText =
          complexityNotSet.length > 1 ? `complexities` : `complexity`;

        Swal.fire({
          title: `Missing ${complexityText}`,
          text: `The complexity of ${complexityNotSet.length} selected ${participantText} is not set. Automatic angle selection will be disabled by default`,
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
          confirmButtonText: `Set ${complexityText}`,
          denyButtonText: `Continue`
        })
          .then(async result => {
            if (!result.isConfirmed) {
              loader.toggle({ message: 'Preparing data...' });
              await mutexLock();
            } else {
              router.switchPage('angles-preview');
            }
          })
          .catch(error => {
            throw new Error(error);
          });
      } else {
        loader.toggle({ message: 'Preparing data...' });
        await mutexLock();
      }
    }
  });
}

changeButton.addEventListener('click', () => {
  SessionStore.clear({ keep: ['data-path', 'analysis'] });
  router.switchPage('data-discovering');
});
