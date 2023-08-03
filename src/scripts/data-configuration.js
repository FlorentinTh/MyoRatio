import '../styles/data-configuration.css';

import emptyCard from '../views/partials/data-configuration/empty-card.hbs';
import dataCard from '../views/partials/data-configuration/data-card.hbs';
import createButton from '../views/partials/data-configuration/create-button.hbs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Swal from 'sweetalert2';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Loader } from './components/loader.js';
import { Switch } from './utils/switch';
import { FileHelper } from './helpers/file-helper';
import { ErrorOverlay, SuccessOverlay } from './components/overlay';
import { DOMElement } from './utils/dom-element';
import { SessionStore } from './utils/session-store.js';
import { PathHelper } from './helpers/path-helper.js';
import { MutexHelper } from './helpers/mutex-helper.js';
import { StringHelper } from './helpers/string-helper.js';
import { Configuration } from './app/configuration.js';

const os = nw.require('os');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(Intl.DateTimeFormat().resolvedOptions().timeZone);

const router = new Router();
router.disableBackButton();

const loader = new Loader();

const menu = new Menu();
const additionalMenuButtons = document.querySelectorAll('[class^="export-"]');
menu.init(additionalMenuButtons);
menu.setItemActive('data-configuration');

SessionStore.clear({
  keep: ['data-path', 'analysis', 'require-setup', 'locked-participant', 'setup']
});

const configuration = new Configuration();
let appData;

try {
  appData = await configuration.load();
} catch (error) {
  const errorOverlay = new ErrorOverlay({
    message: `Data configuration error`,
    details: error.message,
    interact: true
  });

  errorOverlay.show();
}

if ('locked-participant' in sessionStorage) {
  const participant = PathHelper.sanitizePath(
    sessionStorage.getItem('locked-participant').toString().toLowerCase().trim()
  );

  const participantLabel = StringHelper.revertParticipantNameFromSession(participant);

  try {
    await MutexHelper.unlock(participant);
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Internal error`,
      details: `cannot unlock participant: ${participantLabel}`,
      interact: true,
      interactBtnLabel: 'retry',
      redirect: 'data-configuration'
    });

    errorOverlay.show();
  }
}

const toggleSwitchRadioState = (inputValue, opts = { disabled: false }) => {
  const defaultOpts = { disabled: false };
  opts = { ...defaultOpts, ...opts };

  for (const setupSwitchRadio of setupSwitchRadios) {
    if (setupSwitchRadio.value === inputValue) {
      if (opts.disabled) {
        if (!setupSwitchRadio.hasAttribute('disabled')) {
          setupSwitchRadio.setAttribute('disabled', '');
        }
      } else {
        if (setupSwitchRadio.hasAttribute('disabled')) {
          setupSwitchRadio.removeAttribute('disabled');
        }
      }
    }
  }
};

const getActiveSwitchRadio = () => {
  for (const setupSwitchRadio of setupSwitchRadios) {
    if (setupSwitchRadio.checked) {
      return setupSwitchRadio.value;
    }
  }
};

const exportConfigButton = document.querySelector('.export-conf-btn');
const folderInput = document.querySelector('.folder-input');
folderInput.setAttribute('nwworkingdir', os.homedir());

const setupSwitchRadios = Switch.init('setup');
const mainContent = document.querySelector('section.wrapper');

let setupType = getActiveSwitchRadio();

const initPageContent = () => {
  const buttonLabel =
    setupType.toLowerCase() === 'muscles' ? setupType.slice(0, -1) : setupType;

  mainContent.insertAdjacentHTML('beforeend', createButton({ buttonLabel }));

  const submitButton = document.querySelector('button[type="submit"]');

  submitButton.addEventListener('click', event => {
    router.switchPage('add-data');
  });
};

const displayEmptyCard = type => {
  if (type === 'muscles') {
    toggleSwitchRadioState('analysis', { disabled: true });
  }

  dataListElement.insertAdjacentHTML('afterbegin', emptyCard({ type }));
};

const renderDataList = async (type, datas) => {
  if (datas.length > 0) {
    datas.sort((a, b) => {
      return b.label.localeCompare(a.label, undefined, {
        sensitivity: 'base',
        numeric: true
      });
    });
  }

  if (type === 'muscles') {
    const warningMessage = document.getElementById('warning-msg');

    if (!(appData.muscles.length >= 3)) {
      warningMessage.classList.remove('warning-hidden');

      const messageContent = warningMessage.querySelector('span.msg');
      const totalRemaining = 3 - Number(appData.muscles.length);
      const pluralMuscle = totalRemaining > 1 ? 'muscles' : 'muscle';
      messageContent.textContent += ` ${totalRemaining} ${pluralMuscle} to start setting up analysis!`;

      toggleSwitchRadioState('analysis', { disabled: true });
      exportConfigButton.classList.add('export-btn-disabled');
    } else {
      warningMessage.classList.add('warning-hidden');
      toggleSwitchRadioState('analysis', { disabled: false });
    }
  }

  if (appData.muscles.length >= 3 && appData.analysis.length > 0) {
    exportConfigButton.classList.remove('export-btn-disabled');
  }

  for (const data of datas) {
    dataListElement.insertAdjacentHTML('afterbegin', dataCard({ type, data }));
  }
};

const initCards = async items => {
  for (const item of items) {
    const dataLabel = item.querySelector('span.name').textContent.toLowerCase();

    const editButton = item.querySelector('.actions > button#edit');

    if (!(editButton === null)) {
      editButton.addEventListener('click', () => {
        sessionStorage.setItem('update-data', `${dataLabel}`);
        router.switchPage('edit-data');
      });
    }

    const deleteButton = item.querySelector('.actions > button#delete');

    if (!(deleteButton === null)) {
      deleteButton.addEventListener('click', async () => {
        await triggerErrorPopup(
          `Delete ${dataLabel.toUpperCase()}?`,
          `This operation is irreversible. Are you sure to proceed with the deletion?`,
          dataLabel
        );
      });
    }
  }
};

const switchSetupTabHandler = async items => {
  for (const setupSwitchRadio of setupSwitchRadios) {
    setupSwitchRadio.addEventListener('change', async event => {
      DOMElement.clear(dataListElement);
      dataListElement.parentElement.classList.add('change');

      setupType = getActiveSwitchRadio();

      const createButtonElement = document.querySelector('#create-button button');

      const buttonLabel =
        setupType.toLowerCase() === 'muscles' ? setupType.slice(0, -1) : setupType;

      createButtonElement.textContent = `add new ${buttonLabel}`;

      if (!(appData[setupType].length > 0)) {
        dataListElement.classList.add('empty');
        displayEmptyCard(setupType);
      } else {
        await renderDataList(setupType, appData[setupType]);
        dataListElement.parentElement.classList.remove('change');
        await initCards(items);
      }
    });
  }
};

initPageContent();

const dataListElement = document.querySelector('ul.list');

const requiredSetup =
  PathHelper.sanitizePath(
    sessionStorage.getItem('require-setup').toString().toLowerCase().trim()
  ) === 'true';

const dataItems = document.querySelector('ul.list').children;

if (!(appData[setupType].length > 0)) {
  dataListElement.classList.add('empty');
  displayEmptyCard(setupType);
} else {
  await renderDataList(setupType, appData[setupType]);
  await initCards(dataItems);
}

if (!(Object.entries(appData.analysis).length > 0)) {
  if (!requiredSetup) {
    sessionStorage.setItem('require-setup', true);
    menu.toggleItemDisabled('data-discovering', { disabled: true });
  }

  exportConfigButton.classList.add('export-btn-disabled');
} else {
  if (requiredSetup) {
    sessionStorage.setItem('require-setup', false);
    menu.toggleItemDisabled('data-discovering', { disabled: false });
  }
}

await switchSetupTabHandler(dataItems);

const searchMuscleReferences = async dataLabel => {
  const muscle = appData.muscles.find(item => item.label.toLowerCase() === dataLabel);

  const references = [];

  for (const analysis of appData.analysis) {
    if (
      analysis.muscles.antagonist === muscle.id ||
      analysis.muscles.agonist === muscle.id ||
      analysis.muscles.angle === muscle.id
    ) {
      references.push(analysis.label);
    }
  }

  const output = { muscle, length: references.length };

  output.values = references
    .map((value, index) => {
      if (index === references.length - 1) {
        return `& ${value}`;
      } else if (index === references.length - 2) {
        return `${value} `;
      } else {
        return `${value}, `;
      }
    })
    .join('');

  return output;
};

const deleteData = async dataLabel => {
  if (setupType === 'muscles') {
    const references = await searchMuscleReferences(dataLabel);

    if (references.length > 0) {
      Swal.fire({
        title: 'Reference error',
        text: `${StringHelper.capitalize(
          references.muscle.label
        )} cannot be deleted since it is referenced in the following analysis: ${
          references.values
        }`,
        icon: 'error',
        background: '#ededed',
        customClass: {
          confirmButton: 'button-popup cancel'
        },
        buttonsStyling: false,
        padding: '0 0 35px 0',
        allowOutsideClick: false,
        showCancelButton: false,
        showDenyButton: false,
        confirmButtonText: `I understand`
      })
        .then(async result => {
          if (result.isConfirmed) {
            Swal.close();
          }
        })
        .catch(error => {
          throw new Error(error);
        });

      return;
    }
  }

  const messageLabel =
    setupType.toLowerCase() === 'muscles' ? setupType.slice(0, -1) : setupType;
  loader.toggle({ message: `Deleting ${messageLabel}...` });

  try {
    appData[setupType] = appData[setupType].filter(
      item => item.label.toLowerCase() !== dataLabel
    );
    await FileHelper.writeJSONFile(configuration.configurationFilePath, appData);
  } catch (error) {
    loader.toggle();

    const errorOverlay = new ErrorOverlay({
      message: `Cannot update ${messageLabel}`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  router.switchPage('data-configuration');
};

const triggerErrorPopup = async (title, text, dataLabel) => {
  Swal.fire({
    title,
    text,
    icon: 'warning',
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
    confirmButtonText: `Yes`
  })
    .then(async result => {
      if (!result.isConfirmed) {
        Swal.close();
      } else {
        await deleteData(dataLabel);
      }
    })
    .catch(error => {
      throw new Error(error);
    });
};

exportConfigButton.addEventListener('click', event => {
  const currentDate = dayjs().format('D_M_YY');
  folderInput.setAttribute('nwsaveas', `configuration_${currentDate}.json`);
  folderInput.click();
});

folderInput.addEventListener('change', async event => {
  const outputFilePath = event.target.files[0].path;

  loader.toggle({ message: `Exporting data configuration file to:\n ${outputFilePath}` });

  setTimeout(async () => {
    try {
      await FileHelper.writeJSONFile(outputFilePath, appData);
      loader.toggle();

      const successOverlay = new SuccessOverlay({
        message: 'Configuration file successfully saved to:',
        details: `${outputFilePath}`,
        interact: true,
        redirect: 'data-configuration'
      });

      successOverlay.show();
    } catch (error) {
      loader.toggle();

      const errorOverlay = new ErrorOverlay({
        message: 'Impossible to export configuration file',
        details: `Reason: ${error.message}`,
        interact: true,
        redirect: 'data-configuration'
      });

      errorOverlay.show();
    }
  }, 800);
});
