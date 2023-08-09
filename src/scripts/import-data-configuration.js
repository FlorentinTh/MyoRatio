import '../styles/import-data-configuration.css';

import content from '../views/partials/import-data-configuration/content.hbs';

import Swal from 'sweetalert2';
import * as yup from 'yup';

import { Router } from './routes/router.js';
import { Loader } from './components/loader.js';
import { FileHelper } from './helpers/file-helper';
import { ErrorOverlay } from './components/overlay';
import { Configuration } from './app/configuration.js';
import { MuscleModel } from './models/muscle.js';
import { AnalysisModel } from './models/analysis.js';

const os = nw.require('os');

const router = new Router();
router.disableBackButton();

const loader = new Loader();
const configuration = new Configuration();

const contentWrapper = document.querySelector('section.wrapper');
const elements = {};

let dataPath = null;

const initHomeFolderTree = async () => {
  try {
    await FileHelper.createFileOrDirectoryIfNotExists(
      configuration.homeConfigurationFolderPath,
      {
        isDirectory: true,
        hidden: false
      }
    );

    await FileHelper.createFileOrDirectoryIfNotExists(
      configuration.configurationFilePath,
      {
        isDirectory: false,
        hidden: false
      }
    );
  } catch (error) {
    throw new Error(error);
  }
};

const startWithout = async () => {
  loader.toggle({ message: `Initializing the application...` });

  try {
    await initHomeFolderTree();

    await FileHelper.writeJSONFile(configuration.configurationFilePath, {
      analysis: [],
      muscles: []
    });
  } catch (error) {
    loader.toggle();

    const errorOverlay = new ErrorOverlay({
      message: 'The application cannot be initialized',
      details: 'application data cannot be written',
      interact: true
    });

    errorOverlay.show();
  }

  sessionStorage.setItem('require-setup', true);

  setTimeout(() => {
    router.switchPage('data-configuration');
  }, 2000);
};

const toggleDropAreaActive = () => {
  elements.dropArea.classList.toggle('is-active');
  elements.chooseButton.classList.toggle('is-active');
  elements.fileMessage.classList.toggle('is-active');
};

const toggleFilePath = (path = null) => {
  if (!(elements.fileMessage.querySelector('.file-path') === null)) {
    elements.fileMessage.querySelector('.file-path').remove();
  }

  if (path === null) {
    elements.chooseButton.innerText = 'choose a file';
    elements.fileMessage.querySelector(
      '#text'
    ).innerText = `or drag and drop the file here`;
    elements.fileInput.setAttribute('nwworkingdir', os.homedir());
  } else {
    elements.chooseButton.innerText = 'change file';
    elements.fileMessage.querySelector('#text').innerText = `selected file path is`;
    elements.fileInput.setAttribute('nwworkingdir', path);

    const folderPathDiv = document.createElement('div');
    folderPathDiv.classList.add('file-path');
    folderPathDiv.appendChild(document.createTextNode(path));
    elements.fileMessage.appendChild(folderPathDiv);
  }
};

const initPageContent = async () => {
  contentWrapper.insertAdjacentHTML('beforeend', content());

  elements.fileInput = document.querySelector('.file-input');
  elements.dropArea = document.querySelector('.file-drop-area');
  elements.chooseButton = document.querySelector('.choose-btn');
  elements.fileMessage = document.querySelector('.file-msg');
  elements.submitButton = document.querySelector('button[type="submit"]');

  elements.fileInput.setAttribute('nwworkingdir', os.homedir());

  elements.fileInput.addEventListener('dragenter', () => {
    toggleDropAreaActive();
  });

  elements.fileInput.addEventListener('dragleave', () => {
    toggleDropAreaActive();
  });

  elements.fileInput.addEventListener('drop', () => {
    toggleDropAreaActive();
  });

  elements.fileInput.addEventListener('change', event => {
    if (event && event.target.files.length > 0) {
      const folder = event.target.files[0];

      toggleFilePath(folder.path);
      dataPath = folder.path;

      if (elements.submitButton.disabled) {
        elements.submitButton.removeAttribute('disabled');
      }
    } else {
      toggleFilePath();

      dataPath = null;

      if (!elements.submitButton.disabled) {
        elements.submitButton.setAttribute('disabled', '');
      }
    }
  });
};

const validateImportedFileContent = async fileContent => {
  const muscleModel = new MuscleModel({});
  const analysisModel = new AnalysisModel({});

  const configSchema = yup.object({
    analysis: yup.array().of(analysisModel.schema).required(),
    muscles: yup.array().of(muscleModel.schema).required()
  });

  try {
    await configSchema.validate(fileContent);
  } catch (error) {
    throw new Error(error);
  }
};

const importExistingFile = async () => {
  await initPageContent();

  elements.submitButton.addEventListener('click', async () => {
    if (!elements.submitButton.disabled) {
      loader.toggle({ message: `Initializing the application...` });

      let fileContent;

      try {
        fileContent = await FileHelper.parseJSONFile(dataPath);
        await validateImportedFileContent(fileContent);
      } catch (error) {
        sessionStorage.setItem('retry-import', true);

        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: 'The application cannot be initialized',
          details: 'your configuration file is not valid ',
          interact: true,
          interactBtnLabel: 'retry',
          redirect: 'import-data-configuration'
        });

        errorOverlay.show();
        return;
      }

      await initHomeFolderTree();
      await FileHelper.writeJSONFile(configuration.configurationFilePath, fileContent);

      if (fileContent.muscles.length <= 0) {
        sessionStorage.setItem('require-setup', true);

        setTimeout(() => {
          router.switchPage('data-configuration');
        }, 2000);
      } else {
        if (fileContent.analysis.length <= 0) {
          sessionStorage.setItem('require-setup', true);
          sessionStorage.setItem('setup', 'analysis');

          setTimeout(() => {
            router.switchPage('data-configuration');
          }, 2000);
        } else {
          sessionStorage.setItem('require-setup', false);

          setTimeout(() => {
            router.switchPage('data-discovering');
          }, 2000);
        }
      }
    }
  });
};

if ('retry-import' in sessionStorage) {
  sessionStorage.removeItem('retry-import');
  await importExistingFile();
} else {
  Swal.fire({
    title: 'Configuration file import',
    text: 'Do you have an existing data configuration file?',
    icon: 'question',
    background: '#ededed',
    customClass: {
      confirmButton: 'button-popup cancel',
      cancelButton: 'button-popup confirm'
    },
    buttonsStyling: false,
    padding: '0 0 35px 0',
    allowOutsideClick: false,
    showCancelButton: true,
    showDenyButton: false,
    confirmButtonText: 'I have one',
    cancelButtonText: 'Start without'
  })
    .then(async result => {
      if (result.isConfirmed) {
        Swal.close();
        await importExistingFile();
      } else {
        await startWithout();
      }
    })
    .catch(error => {
      throw new Error(error);
    });
}
