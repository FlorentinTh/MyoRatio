import '../styles/add-edit-data.css';

import content from '../views/partials/add-edit-data/content.hbs';

import { createPopper } from '@popperjs/core';
import SlimSelect from 'slim-select';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Loader } from './components/loader.js';
import { FileHelper } from './helpers/file-helper';
import { ErrorOverlay } from './components/overlay';
import { StringHelper } from './helpers/string-helper';
import { PathHelper } from './helpers/path-helper';
import { Configuration } from './app/configuration';
import { AnalysisModel } from './models/analysis.js';
import { MuscleModel } from './models/muscle.js';

const router = new Router();
router.disableBackButton();

const loader = new Loader();

const menu = new Menu();
menu.init();
menu.setItemActive('data-configuration');

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

const contentWrapper = document.querySelector('section.wrapper');

let setupType;

if ('setup' in sessionStorage) {
  setupType = PathHelper.sanitizePath(
    sessionStorage.getItem('setup').toString().trim().toLowerCase()
  );
}

const muscleSelectPlaceholderText = 'Choose a muscle';

let selectAntagonist = null;
let selectAgonist = null;
let selectAngle = null;
let concentricLabelSwitch = null;
let eccentricLabelSwitch = null;
let angleMethodSwitch = null;

const isRequiredInputValid = () => {
  const textInputs = document.querySelectorAll('input[type="text"]');

  const requiredInputs = {};

  for (const textInput of textInputs) {
    if (textInput.classList.contains('input-text-required')) {
      requiredInputs[textInput.id] = textInput.value.trim();
    }
  }

  if (setupType === 'analysis') {
    if (selectAntagonist !== null && selectAgonist !== null && selectAngle !== null) {
      requiredInputs[selectAntagonist.selectEl.id] = selectAntagonist.getSelected()[0];
      requiredInputs[selectAgonist.selectEl.id] = selectAgonist.getSelected()[0];
      requiredInputs[selectAngle.selectEl.id] = selectAngle.getSelected()[0];
    }
  }

  const textInputValues = [];
  const selectValues = [];

  for (const requiredInput of Object.entries(requiredInputs)) {
    const element = requiredInput[0];
    const value = requiredInput[1];

    if (element.includes('select')) {
      selectValues.push(value);
    } else {
      textInputValues.push(value);
    }
  }

  if (selectValues.length > 0) {
    if (textInputValues.includes('')) {
      return false;
    }

    if (selectValues.includes(muscleSelectPlaceholderText)) {
      return false;
    }

    return new Set(selectValues).size === selectValues.length;
  } else {
    return !textInputValues.includes('');
  }
};

const displayContent = async () => {
  const contentTitle = setupType === 'muscles' ? setupType.slice(0, -1) : setupType;
  contentWrapper.insertAdjacentHTML(
    'beforeend',
    content({ operation: 'New', contentTitle })
  );

  const textInputs = document.querySelectorAll('input[type="text"]');

  for (const textInput of textInputs) {
    textInput.addEventListener('input', event => {
      if (setupType === 'muscles') {
        event.target.value = event.target.value.toLowerCase().replace(/ +/g, ' ');
      } else {
        event.target.value = event.target.value
          .toLowerCase()
          .replace(/ +/g, '-')
          .replace(/-+/g, '-');
      }

      if (isRequiredInputValid()) {
        submitButton.removeAttribute('disabled');
      } else {
        submitButton.setAttribute('disabled', '');
      }
    });

    textInput.addEventListener('blur', event => {
      if (setupType === 'muscles') {
        event.target.value = event.target.value.trim();
      } else {
        event.target.value = event.target.value.trim().replace(/^-|-$/g, '');
      }
    });
  }

  if (setupType === 'analysis') {
    const muscles = appData.muscles.sort((a, b) => {
      return a.label.localeCompare(b.label, undefined, {
        sensitivity: 'base',
        numeric: true
      });
    });

    concentricLabelSwitch = document.getElementById('switch-concentric-type').children;
    eccentricLabelSwitch = document.getElementById('switch-eccentric-type').children;
    angleMethodSwitch = document.getElementById('switch-angle-type').children;

    const concentricLabelSwitchRadios = [...concentricLabelSwitch].filter(
      item => item.type === 'radio'
    );

    const eccentricLabelSwitchRadios = [...eccentricLabelSwitch].filter(
      item => item.type === 'radio'
    );

    for (const concentricLabelSwitchRadio of concentricLabelSwitchRadios) {
      concentricLabelSwitchRadio.addEventListener('change', event => {
        if (concentricLabelSwitchRadio.value === 'opening') {
          for (const eccentricLabelSwitchRadio of eccentricLabelSwitchRadios) {
            if (eccentricLabelSwitchRadio.value === 'opening') {
              eccentricLabelSwitchRadio.checked = false;
            } else {
              eccentricLabelSwitchRadio.checked = true;
            }
          }
        } else {
          for (const eccentricLabelSwitchRadio of eccentricLabelSwitchRadios) {
            if (eccentricLabelSwitchRadio.value === 'opening') {
              eccentricLabelSwitchRadio.checked = true;
            } else {
              eccentricLabelSwitchRadio.checked = false;
            }
          }
        }
      });
    }

    for (const eccentricLabelSwitchRadio of eccentricLabelSwitchRadios) {
      eccentricLabelSwitchRadio.addEventListener('change', event => {
        if (eccentricLabelSwitchRadio.value === 'opening') {
          for (const concentricLabelSwitchRadio of concentricLabelSwitchRadios) {
            if (concentricLabelSwitchRadio.value === 'opening') {
              concentricLabelSwitchRadio.checked = false;
            } else {
              concentricLabelSwitchRadio.checked = true;
            }
          }
        } else {
          for (const concentricLabelSwitchRadio of concentricLabelSwitchRadios) {
            if (concentricLabelSwitchRadio.value === 'opening') {
              concentricLabelSwitchRadio.checked = true;
            } else {
              concentricLabelSwitchRadio.checked = false;
            }
          }
        }
      });
    }

    const muscleSelectData = [{ text: muscleSelectPlaceholderText, placeholder: true }];

    for (const muscle of muscles) {
      muscleSelectData.push({
        text: muscle.label,
        value: muscle.id
      });
    }

    selectAntagonist = new SlimSelect({
      select: '#select-antagonist',
      settings: {
        openPosition: 'down',
        hideSelected: true,
        searchHighlight: true
      },
      events: {
        afterClose: () => {
          if (isRequiredInputValid()) {
            submitButton.removeAttribute('disabled');
          } else {
            submitButton.setAttribute('disabled', '');
          }
        }
      }
    });

    selectAgonist = new SlimSelect({
      select: '#select-agonist',
      settings: {
        openPosition: 'down',
        hideSelected: true,
        searchHighlight: true
      },
      events: {
        afterClose: () => {
          if (isRequiredInputValid()) {
            submitButton.removeAttribute('disabled');
          } else {
            submitButton.setAttribute('disabled', '');
          }
        }
      }
    });

    selectAngle = new SlimSelect({
      select: '#select-angle',
      settings: {
        openPosition: 'down',
        hideSelected: true,
        searchHighlight: true
      },
      events: {
        afterClose: () => {
          if (isRequiredInputValid()) {
            submitButton.removeAttribute('disabled');
          } else {
            submitButton.setAttribute('disabled', '');
          }
        }
      }
    });

    selectAntagonist.setData(muscleSelectData);
    selectAgonist.setData(muscleSelectData);
    selectAngle.setData(muscleSelectData);
  }
};

await displayContent();

const submitButton = document.querySelector('button[type="submit"]');
const resetButton = document.querySelector('button[type="reset"]');

const tooltips = document.querySelectorAll('.tooltip-info');

const initTooltips = (identifiers, tooltips, placement) => {
  for (let i = 0; i < identifiers.length; i++) {
    const popperInstance = createPopper(identifiers[i], tooltips[i], {
      placement
    });

    identifiers[i].addEventListener('mouseenter', () => {
      tooltips[i].setAttribute('data-show', '');
      popperInstance.update();
    });

    identifiers[i].addEventListener('mouseleave', () => {
      tooltips[i].removeAttribute('data-show');
    });
  }
};

const tooltipsIdentifiers = document.querySelectorAll('.label i');
initTooltips(tooltipsIdentifiers, tooltips, 'right');

const triggerErrorPopup = (title, text) => {
  Swal.fire({
    title,
    text,
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
    confirmButtonText: `Update`
  })
    .then(async result => {
      if (result.isConfirmed) {
        Swal.close();
      }
    })
    .catch(error => {
      throw new Error(error);
    });
};

const addNewMuscle = async () => {
  const formData = { id: uuidv4() };

  const labelInput = document.getElementById('label');
  formData.label = StringHelper.capitalize(labelInput.value.trim().toLowerCase());

  const muscleModel = new MuscleModel(formData);

  let dataValidated;

  try {
    dataValidated = await muscleModel.validate();
  } catch (error) {
    triggerErrorPopup('Invalid form', error.toString());
    return;
  }

  await writeData(dataValidated);
};

const addNewAnalysis = async () => {
  const formData = { id: uuidv4() };

  const labelInput = document.getElementById('label');
  formData.label = StringHelper.capitalize(
    labelInput.value.trim().toLowerCase().replace(/^-|-$/g, '')
  );

  formData.stages = { concentric: {}, eccentric: {} };
  formData.muscles = {};

  const concentricLabelInput = document.getElementById('concentric-label');

  let concentricLabelInputValue = concentricLabelInput.value
    .trim()
    .toLowerCase()
    .replace(/^-|-$/g, '');

  if (!(concentricLabelInputValue === '')) {
    concentricLabelInputValue = StringHelper.capitalize(concentricLabelInputValue);
  }

  formData.stages.concentric.label = concentricLabelInputValue;

  const eccentricLabelInput = document.getElementById('eccentric-label');

  let eccentricLabelInputValue = eccentricLabelInput.value
    .trim()
    .toLowerCase()
    .replace(/^-|-$/g, '');

  if (!(eccentricLabelInputValue === '')) {
    eccentricLabelInputValue = StringHelper.capitalize(eccentricLabelInputValue);
  }

  formData.stages.eccentric.label = eccentricLabelInputValue;

  const concentricChecked = [...concentricLabelSwitch].find(
    item => item.type === 'radio' && item.checked
  );

  formData.stages.concentric.opening = concentricChecked.value === 'opening';

  const eccentricChecked = [...eccentricLabelSwitch].find(
    item => item.type === 'radio' && item.checked
  );

  formData.stages.eccentric.opening = eccentricChecked.value === 'opening';

  const antagonistMuscle = selectAntagonist.getSelected()[0];
  const agonistMuscle = selectAgonist.getSelected()[0];
  const angleMuscle = selectAngle.getSelected()[0];

  const angleMethodChecked = [...angleMethodSwitch].find(
    item => item.type === 'radio' && item.checked
  );

  formData.is_angle_advanced = angleMethodChecked.value === 'advanced';

  if (antagonistMuscle === muscleSelectPlaceholderText) {
    triggerErrorPopup('Invalid form', 'You must select an antagonist muscle');
    return;
  } else {
    formData.muscles.antagonist = antagonistMuscle;
  }

  if (agonistMuscle === muscleSelectPlaceholderText) {
    triggerErrorPopup('Invalid form', 'You must select an agonist muscle');
    return;
  } else {
    formData.muscles.agonist = agonistMuscle;
  }

  if (angleMuscle === muscleSelectPlaceholderText) {
    triggerErrorPopup('Invalid form', 'You must select a muscle for angle computation');
    return;
  } else {
    formData.muscles.angle = angleMuscle;
  }

  const analysisModel = new AnalysisModel(formData);

  let dataValidated;

  try {
    dataValidated = await analysisModel.validate();
  } catch (error) {
    triggerErrorPopup('Invalid form', error.toString());
    return;
  }

  await writeData(dataValidated);
};

const writeData = async data => {
  const messageLabel = setupType === 'muscles' ? setupType.slice(0, -1) : setupType;
  loader.toggle({ message: `Saving new ${messageLabel}...` });

  try {
    const existingItems = new Set(appData[setupType].map(item => item.label));

    if (!existingItems.has(data.label)) {
      appData[setupType].push(data);
    } else {
      loader.toggle();

      triggerErrorPopup(
        'Invalid form',
        `${StringHelper.capitalize(messageLabel)} already exists`
      );

      return;
    }

    await FileHelper.writeJSONFile(configuration.configurationFilePath, appData);
  } catch (error) {
    loader.toggle();

    const errorOverlay = new ErrorOverlay({
      message: `Cannot create ${messageLabel}`,
      details: `an error occurs while trying to save new ${messageLabel}`,
      interact: true
    });

    errorOverlay.show();
  }

  router.switchPage('data-configuration');
};

resetButton.addEventListener('click', event => {
  router.switchPage('data-configuration');
});

submitButton.addEventListener('click', async event => {
  if (setupType === 'muscles') {
    await addNewMuscle();
  } else {
    await addNewAnalysis();
  }
});
