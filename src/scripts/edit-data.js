import '../styles/add-edit-data.css';

import content from '../views/partials/add-edit-data/content.hbs';

import { createPopper } from '@popperjs/core';
import SlimSelect from 'slim-select';
import Swal from 'sweetalert2';
import * as yup from 'yup';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Loader } from './components/loader.js';
import { FileHelper } from './helpers/file-helper';
import { ErrorOverlay } from './components/overlay';
import { StringHelper } from './helpers/string-helper';
import { PathHelper } from './helpers/path-helper.js';
import { Configuration } from './app/configuration.js';

const router = new Router();
router.disableBackButton();

const loader = new Loader();

const menu = new Menu();
menu.init();
menu.setItemActive('data-configuration');

const contentWrapper = document.querySelector('section.wrapper');

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

let setupType;
let data;

if ('setup' in sessionStorage) {
  setupType = PathHelper.sanitizePath(
    sessionStorage.getItem('setup').toString().toLowerCase().trim()
  );
}

const muscleSelectPlaceholderText = 'Choose a muscle';

const elements = {};

const isRequiredInputValid = () => {
  const textInputs = document.querySelectorAll('input[type="text"]');

  const requiredInputs = {};

  for (const textInput of textInputs) {
    if (textInput.classList.contains('input-text-required')) {
      requiredInputs[textInput.id] = textInput.value.trim();
    }
  }

  if (setupType === 'analysis') {
    if (
      elements.selectAntagonist !== null &&
      elements.selectAgonist !== null &&
      elements.selectAngle !== null
    ) {
      requiredInputs[elements.selectAntagonist.selectEl.id] =
        elements.selectAntagonist.getSelected()[0];
      requiredInputs[elements.selectAgonist.selectEl.id] =
        elements.selectAgonist.getSelected()[0];
      requiredInputs[elements.selectAngle.selectEl.id] =
        elements.selectAngle.getSelected()[0];
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

const displayContent = () => {
  const contentTitle = setupType === 'muscles' ? setupType.slice(0, -1) : setupType;
  contentWrapper.insertAdjacentHTML(
    'beforeend',
    content({ operation: 'Edit', contentTitle })
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

    const concentricLabelSwitch = document.getElementById(
      'switch-concentric-type'
    ).children;

    const eccentricLabelSwitch = document.getElementById(
      'switch-eccentric-type'
    ).children;

    const angleMethodSwitch = document.getElementById('switch-angle-type').children;

    elements.concentricLabelSwitchRadios = [...concentricLabelSwitch].filter(
      item => item.type === 'radio'
    );

    elements.eccentricLabelSwitchRadios = [...eccentricLabelSwitch].filter(
      item => item.type === 'radio'
    );

    elements.angleMethodSwitchRadios = [...angleMethodSwitch].filter(
      item => item.type === 'radio'
    );

    for (const concentricLabelSwitchRadio of elements.concentricLabelSwitchRadios) {
      concentricLabelSwitchRadio.addEventListener('change', event => {
        if (concentricLabelSwitchRadio.value === 'opening') {
          for (const eccentricLabelSwitchRadio of elements.eccentricLabelSwitchRadios) {
            if (eccentricLabelSwitchRadio.value === 'opening') {
              eccentricLabelSwitchRadio.checked = false;
            } else {
              eccentricLabelSwitchRadio.checked = true;
            }
          }
        } else {
          for (const eccentricLabelSwitchRadio of elements.eccentricLabelSwitchRadios) {
            if (eccentricLabelSwitchRadio.value === 'opening') {
              eccentricLabelSwitchRadio.checked = true;
            } else {
              eccentricLabelSwitchRadio.checked = false;
            }
          }
        }
      });
    }

    for (const eccentricLabelSwitchRadio of elements.eccentricLabelSwitchRadios) {
      eccentricLabelSwitchRadio.addEventListener('change', event => {
        if (eccentricLabelSwitchRadio.value === 'opening') {
          for (const concentricLabelSwitchRadio of elements.concentricLabelSwitchRadios) {
            if (concentricLabelSwitchRadio.value === 'opening') {
              concentricLabelSwitchRadio.checked = false;
            } else {
              concentricLabelSwitchRadio.checked = true;
            }
          }
        } else {
          for (const concentricLabelSwitchRadio of elements.concentricLabelSwitchRadios) {
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

    elements.selectAntagonist = new SlimSelect({
      select: '#select-antagonist',
      settings: {
        openPosition: 'down',
        hideSelected: true,
        searchHighlight: true
      },
      events: {
        afterChange: event => {
          if (isRequiredInputValid()) {
            submitButton.removeAttribute('disabled');
          } else {
            submitButton.setAttribute('disabled', '');
          }
        }
      }
    });

    elements.selectAgonist = new SlimSelect({
      select: '#select-agonist',
      settings: {
        openPosition: 'down',
        hideSelected: true,
        searchHighlight: true
      },
      events: {
        afterChange: event => {
          if (isRequiredInputValid()) {
            submitButton.removeAttribute('disabled');
          } else {
            submitButton.setAttribute('disabled', '');
          }
        }
      }
    });

    elements.selectAngle = new SlimSelect({
      select: '#select-angle',
      settings: {
        openPosition: 'down',
        hideSelected: true,
        searchHighlight: true
      },
      events: {
        afterChange: event => {
          if (isRequiredInputValid()) {
            submitButton.removeAttribute('disabled');
          } else {
            submitButton.setAttribute('disabled', '');
          }
        }
      }
    });

    elements.selectAntagonist.setData(muscleSelectData);
    elements.selectAgonist.setData(muscleSelectData);
    elements.selectAngle.setData(muscleSelectData);
  }
};

const getDataFromLabel = async updateDataLabel => {
  try {
    const key = Object.keys(appData).filter(key => key.includes(setupType))[0];
    return appData[key].filter(item => item.label.toLowerCase() === updateDataLabel)[0];
  } catch (error) {
    loader.toggle();

    const errorOverlay = new ErrorOverlay({
      message: 'Cannot read application data',
      details: `an error occurs while trying to read application data`,
      interact: true
    });

    errorOverlay.show();
  }
};

const displayData = async updateDataLabel => {
  data = await getDataFromLabel(updateDataLabel);

  const labelInput = document.getElementById('label');
  labelInput.value = data.label.toLowerCase();
  elements.labelInput = labelInput;

  if (setupType === 'analysis') {
    const concentricLabelInput = document.getElementById('concentric-label');
    elements.concentricLabelInput = concentricLabelInput;

    const eccentricLabelInput = document.getElementById('eccentric-label');
    elements.eccentricLabelInput = eccentricLabelInput;

    if (!(data.stages.concentric.label === '')) {
      concentricLabelInput.value = data.stages.concentric.label.trim().toLowerCase();
    }

    if (data.stages.concentric.opening) {
      elements.concentricLabelSwitchRadios.find(item =>
        item.id.includes('opening')
      ).checked = true;

      elements.concentricLabelSwitchRadios.find(item =>
        item.id.includes('closing')
      ).checked = false;
    } else {
      elements.concentricLabelSwitchRadios.find(item =>
        item.id.includes('opening')
      ).checked = false;

      elements.concentricLabelSwitchRadios.find(item =>
        item.id.includes('closing')
      ).checked = true;
    }

    if (data.is_angle_advanced) {
      elements.angleMethodSwitchRadios.find(item =>
        item.id.includes('advanced')
      ).checked = true;
    } else {
      elements.angleMethodSwitchRadios.find(item =>
        item.id.includes('standard')
      ).checked = true;
    }

    if (!(data.stages.eccentric.label === '')) {
      eccentricLabelInput.value = data.stages.eccentric.label.trim().toLowerCase();
    }

    if (data.stages.eccentric.opening) {
      elements.eccentricLabelSwitchRadios.find(item =>
        item.id.includes('opening')
      ).checked = true;

      elements.eccentricLabelSwitchRadios.find(item =>
        item.id.includes('closing')
      ).checked = false;
    } else {
      elements.eccentricLabelSwitchRadios.find(item =>
        item.id.includes('opening')
      ).checked = false;

      elements.eccentricLabelSwitchRadios.find(item =>
        item.id.includes('closing')
      ).checked = true;
    }

    elements.selectAntagonist.setSelected(data.muscles.antagonist);
    elements.selectAgonist.setSelected(data.muscles.agonist);
    elements.selectAngle.setSelected(data.muscles.angle);
  }
};

displayContent();

const submitButton = document.querySelector('button[type="submit"]');
const resetButton = document.querySelector('button[type="reset"]');

if (isRequiredInputValid()) {
  submitButton.removeAttribute('disabled');
} else {
  submitButton.setAttribute('disabled', '');
}

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

let updateDataLabel;

if ('update-data' in sessionStorage) {
  updateDataLabel = PathHelper.sanitizePath(
    sessionStorage.getItem('update-data').toString().toLowerCase().trim()
  );
} else {
  throw Error('Cannot load data to be updated');
}

await displayData(updateDataLabel);

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

const getMuscleData = async () => {
  const schema = yup.object().shape({
    label: yup.string().trim().required()
  });

  const formData = {
    label: StringHelper.capitalize(elements.labelInput.value.trim().toLowerCase())
  };
  return { schema, formData };
};

const getAnalysisData = async () => {
  const schema = yup.object().shape({
    label: yup.string().trim().required(),
    stages: yup.object({
      concentric: yup.object({
        label: yup.string().trim(),
        opening: yup.boolean().required()
      }),
      eccentric: yup.object({
        label: yup.string().trim(),
        opening: yup.boolean().required()
      })
    }),
    muscles: yup.object({
      antagonist: yup.string().trim().required(),
      agonist: yup.string().trim().required(),
      angle: yup.string().trim().required()
    }),
    is_angle_advanced: yup.boolean().required()
  });

  let concentricLabelValue = elements.concentricLabelInput.value
    .toLowerCase()
    .replace(/^-|-$/g, '');
  let eccentricLabelValue = elements.eccentricLabelInput.value
    .toLowerCase()
    .replace(/^-|-$/g, '');

  if (!(concentricLabelValue === '')) {
    concentricLabelValue = StringHelper.capitalize(concentricLabelValue);
  }

  if (!(eccentricLabelValue === '')) {
    eccentricLabelValue = StringHelper.capitalize(eccentricLabelValue);
  }

  const formData = {
    label: StringHelper.capitalize(
      elements.labelInput.value.toLowerCase().replace(/^-|-$/g, '')
    ),
    stages: {
      concentric: {
        label: concentricLabelValue,
        opening: elements.concentricLabelSwitchRadios
          .find(item => item.checked)
          .id.includes('opening')
      },
      eccentric: {
        label: eccentricLabelValue,
        opening: elements.eccentricLabelSwitchRadios
          .find(item => item.checked)
          .id.includes('opening')
      }
    },
    muscles: {
      antagonist: elements.selectAntagonist.getSelected()[0],
      agonist: elements.selectAgonist.getSelected()[0],
      angle: elements.selectAngle.getSelected()[0]
    },
    is_angle_advanced: elements.angleMethodSwitchRadios
      .find(item => item.checked)
      .id.includes('advanced')
  };

  return { schema, formData };
};

const updateData = async () => {
  let schema, formData;

  if (setupType === 'muscles') {
    ({ schema, formData } = await getMuscleData());
  } else {
    ({ schema, formData } = await getAnalysisData());
  }

  try {
    await schema.validate(formData);
  } catch (error) {
    triggerErrorPopup('Invalid form', `Reason: ${error.toString().split(':')[1]}`);
    return;
  }

  const messageLabel = setupType === 'muscles' ? setupType.slice(0, -1) : setupType;
  loader.toggle({ message: `Updating ${messageLabel}...` });

  try {
    const itemsToKeep = appData[setupType].filter(item => item.label !== data.label);
    const existingItems = new Set(itemsToKeep.map(item => item.label));

    if (!existingItems.has(formData.label)) {
      appData[setupType] = appData[setupType].map(item => {
        if (item.label === data.label) {
          return { ...item, ...formData };
        }

        return item;
      });
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
      message: `Cannot update ${messageLabel}`,
      details: `an error occurs while trying to update ${messageLabel}`,
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
  await updateData();
});
