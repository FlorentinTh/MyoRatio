import '../styles/components/folder-input.css';
import '../styles/components/popup.css';

import Swal from 'sweetalert2';
import Choices from 'choices.js';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Loader } from './components/loader.js';
import { ErrorOverlay } from './components/overlay.js';
import { Metadata } from './app/metadata.js';
import { PathHelper } from './helpers/path-helper.js';
import { SessionStore } from './utils/session-store';
import { Environment } from './app/environment.js';
import { getAllParticipants } from './utils/participants';
import { PlatformHelper } from './helpers/platform-helper';
import { FileHelper } from './helpers/file-helper';
import { MutexHelper } from './helpers/mutex-helper.js';
import { StringHelper } from './helpers/string-helper.js';
import { ObjectHelper } from './helpers/object-helper.js';
import { Configuration } from './app/configuration.js';

const os = nw.require('os');
const path = nw.require('path');

const router = new Router();
router.disableBackButton();

SessionStore.clear({
  keep: ['data-path', 'analysis', 'require-setup', 'locked-participant']
});

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
      redirect: 'data-discovering'
    });

    errorOverlay.show();
  }
}

const loader = new Loader();
const environment = await Environment.load();

const menu = new Menu();
menu.init();
menu.setItemActive('data-discovering');

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

if (Object.entries(appData.analysis).length <= 0) {
  sessionStorage.setItem('require-setup', true);

  const errorOverlay = new ErrorOverlay({
    message: `Data not found`,
    details: `no analysis has yet been created. Please start by setting up some analysis`,
    interact: true,
    redirect: 'data-configuration',
    interactBtnLabel: 'Go to configuration'
  });

  errorOverlay.show();
}

const folderInput = document.querySelector('.folder-input');
const dropArea = document.querySelector('.folder-drop-area');
const chooseButton = document.querySelector('.choose-btn');
const folderMessage = document.querySelector('.folder-msg');
const submitButton = document.querySelector('button[type="submit"]');

folderInput.setAttribute('nwworkingdir', os.homedir());

let analysisSelectData = [
  {
    value: 'placeholder',
    label: 'Choose an analysis',
    placeholder: true,
    disabled: true,
    selected: true
  }
];

const selectAnalysis = new Choices('#select-analysis', {
  placeholder: true,
  placeholderValue: 'Choose an analysis',
  searchPlaceholderValue: 'Search analysis',
  noResultsText: 'No analysis found',
  noChoicesText: 'No analysis to choose from',
  addItems: false,
  removeItems: false,
  itemSelectText: ''
});

selectAnalysis.setChoices(analysisSelectData);

selectAnalysis.passedElement.element.addEventListener('addItem', event => {
  if (!(event.detail.value === 'placeholder')) {
    sessionStorage.setItem('analysis', event.detail.value);

    if (submitButton.disabled) {
      submitButton.removeAttribute('disabled');
    }
  }
});

const toggleDropAreaActive = () => {
  dropArea.classList.toggle('is-active');
  chooseButton.classList.toggle('is-active');
  folderMessage.classList.toggle('is-active');
};

folderInput.addEventListener('dragenter', () => {
  toggleDropAreaActive();
});

folderInput.addEventListener('dragleave', () => {
  toggleDropAreaActive();
});

folderInput.addEventListener('drop', () => {
  toggleDropAreaActive();
});

const toggleFolderPath = (path = null, fromSession = false) => {
  if (!(folderMessage.querySelector('.folder-path') === null)) {
    folderMessage.querySelector('.folder-path').remove();
  }

  if (path === null) {
    chooseButton.innerText = 'choose a folder';
    folderMessage.querySelector('#text').innerText = `or drag and drop the folder here`;
    folderInput.setAttribute('nwworkingdir', os.homedir());
  } else {
    if (fromSession) {
      const changeEvent = new Event('change');
      folderInput.dispatchEvent(changeEvent);

      const existingFile = new File([], '', {});
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(existingFile);

      folderInput.files = dataTransfer.files;
    }

    chooseButton.innerText = 'change folder';
    folderMessage.querySelector('#text').innerText = `selected folder path is`;
    folderInput.setAttribute('nwworkingdir', path);

    const folderPathDiv = document.createElement('div');
    folderPathDiv.classList.add('folder-path');
    folderPathDiv.appendChild(document.createTextNode(path));
    folderMessage.appendChild(folderPathDiv);
  }
};

const fetchParticipantIMUData = async (
  dataPath,
  analysis,
  participants,
  override,
  config
) => {
  const port = localStorage.getItem('port') ?? environment.PORT;

  return await fetch(`http://${environment.HOST}:${port}/api/data/imu/`, {
    headers: {
      'X-API-Key': environment.API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      data_path: dataPath,
      analysis,
      participants,
      override,
      config
    })
  });
};

const enableSelectAnalysisData = async (rootFolderPath = null) => {
  analysisSelectData = [
    {
      value: 'placeholder',
      label: 'Choose an analysis',
      placeholder: true,
      disabled: true,
      selected: true
    }
  ];

  if (!(rootFolderPath === null)) {
    let folderContent;

    try {
      folderContent = await FileHelper.listAllFiles(
        path.join(rootFolderPath, 'Analysis')
      );
    } catch (error) {
      throw new Error(error);
    }

    for (const analysis of appData.analysis) {
      if (folderContent.includes(analysis.label)) {
        analysisSelectData.push({
          value: analysis.label.toLowerCase(),
          label: analysis.label
        });
      }
    }
  }

  selectAnalysis.clearChoices();
  selectAnalysis.setChoices(analysisSelectData);
  selectAnalysis.enable();
};

if ('data-path' in sessionStorage) {
  const dataPath = PathHelper.sanitizePath(
    sessionStorage.getItem('data-path').toString().trim()
  );

  toggleFolderPath(dataPath, true);

  try {
    await enableSelectAnalysisData(dataPath);
  } catch (error) {
    sessionStorage.removeItem('data-path');
    const errorOverlay = new ErrorOverlay({
      message: `Data not found`,
      details: `cannot read root data folder content`,
      interact: true,
      redirect: 'data-discovering'
    });

    errorOverlay.show();
  }

  if ('analysis' in sessionStorage) {
    const selectedAnalysis = PathHelper.sanitizePath(
      sessionStorage.getItem('analysis').toString().toLowerCase().trim()
    );

    if (
      !(analysisSelectData.find(item => item.value === selectedAnalysis) === undefined)
    ) {
      selectAnalysis.clearChoices();
      selectAnalysis.setChoices(analysisSelectData);
      selectAnalysis.setChoiceByValue(selectedAnalysis);
      submitButton.removeAttribute('disabled');
    } else {
      sessionStorage.removeItem('analysis');
    }
  }
}

folderInput.addEventListener('change', async event => {
  if (event && event.target.files.length > 0) {
    const folder = event.target.files[0];

    toggleFolderPath(folder.path);
    sessionStorage.setItem('data-path', folder.path);

    try {
      await enableSelectAnalysisData(folder.path);
    } catch (error) {
      sessionStorage.removeItem('data-path');

      const redirectConverter = !PlatformHelper.isMacOsPlatform() ? 'converter' : '';

      if (!(redirectConverter === '')) {
        sessionStorage.setItem('data-path', folder.path);
      }

      const errorOverlay = new ErrorOverlay({
        message: `Data not found`,
        details: `please ensure that the HPF data are converted properly`,
        interact: true,
        redirect: redirectConverter,
        interactBtnLabel: 'Go to converter'
      });

      errorOverlay.show();
      return;
    }
  } else {
    toggleFolderPath();

    await enableSelectAnalysisData();
    selectAnalysis.setChoiceByValue('placeholder');
    selectAnalysis.disable();

    if ('analysis' in sessionStorage) {
      sessionStorage.removeItem('analysis');
    }

    const sessionAnalysis = PathHelper.sanitizePath(
      sessionStorage.getItem('data-path').toString().toLowerCase().trim()
    );

    if (!(sessionAnalysis === null)) {
      sessionStorage.removeItem('data-path');
    }

    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  }
});

const rollWaitingMessage = (overlay, messages, index) => {
  overlay.loaderMessage.innerText = messages[0];
  overlay.loaderMessage.innerText += `\n ${messages[index]}`;

  if (index === 4) {
    index = 2;
  } else {
    index++;
  }

  setTimeout(rollWaitingMessage, 10000, overlay, messages, index);
};

const triggerOverridePopup = (title, text) => {
  return new Promise((resolve, reject) => {
    Swal.fire({
      title,
      text,
      icon: 'warning',
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
      confirmButtonText: `override`
    })
      .then(async result => {
        if (result.isConfirmed) {
          resolve(true);
        }

        resolve(false);
      })
      .catch(error => {
        reject(error);
      });
  });
};

submitButton.addEventListener('click', async () => {
  if (!submitButton.disabled) {
    loader.toggle({ message: 'Discovering data...' });

    if ('data-path' in sessionStorage) {
      const dataPath = PathHelper.sanitizePath(
        sessionStorage.getItem('data-path').toString().trim()
      );

      const metadata = new Metadata(dataPath);

      let isBaseFolderContentCompliant;

      const redirectConverter = !PlatformHelper.isMacOsPlatform() ? 'converter' : '';

      try {
        isBaseFolderContentCompliant = await metadata.checkBaseFolderContent();
      } catch (error) {
        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `Cannot verify content of input data folder`,
          details: `please ensure that the HPF data are converted properly`,
          interact: true,
          redirect: redirectConverter,
          interactBtnLabel: 'Go to converter'
        });

        errorOverlay.show();
        return;
      }

      let isMetadataFolderInit;

      if (isBaseFolderContentCompliant) {
        try {
          const selectData = selectAnalysis.getValue().value;
          isMetadataFolderInit = await metadata.createMetadataFolderTree(selectData);
        } catch (error) {
          loader.toggle();
          const errorOverlay = new ErrorOverlay({
            message: `Application cannot initialize the metadata tree`,
            details: error.message,
            interact: true
          });
          errorOverlay.show();
          return;
        }
      } else {
        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: `Input data folder does not meet file structure requirements`,
          details: `please ensure that the HPF are converted properly`,
          interact: true,
          redirect: redirectConverter
        });

        errorOverlay.show();
        return;
      }

      const analysisType = PathHelper.sanitizePath(
        sessionStorage.getItem('analysis').toString().toLowerCase().trim()
      );

      const analysisFolderPath = path.join(dataPath, 'analysis', analysisType);

      let participants;
      let getParticipantError;

      if (isMetadataFolderInit) {
        try {
          participants = await getAllParticipants(analysisFolderPath);
        } catch (error) {
          getParticipantError = error;

          loader.toggle();

          const errorOverlay = new ErrorOverlay({
            message: `Error occurs while trying to retrieve participants`,
            details: error.message,
            interact: true,
            redirect: 'data-discovering'
          });

          errorOverlay.show();
        }
      }

      if (getParticipantError === undefined) {
        if (participants.length > 0) {
          loader.loaderMessage.innerText = `Found ${participants.length} participants...`;

          for (const participant of participants) {
            try {
              await metadata.createMetadataParticipantFolder(analysisType, participant);
            } catch (error) {
              loader.toggle();

              const errorOverlay = new ErrorOverlay({
                message: `The application cannot initialize metadata tree for participants`,
                details: error.message,
                interact: true
              });

              errorOverlay.show();
              return;
            }
          }

          const messages = [
            `Initializing ${participants.length} participants...`,
            `It may take some times!`,
            `Hold on, we are working on it!`,
            `Almost there!`,
            `Just a few more steps`
          ];

          loader.loaderMessage.innerText = messages[0];
          const messageIndex = 1;

          setTimeout(() => {
            rollWaitingMessage(loader, messages, messageIndex);
          }, 3500);

          const dataConfig = appData.analysis.find(
            item => item.label.toLowerCase() === analysisType
          );

          const analysisConfigFilePath = path.join(
            metadata.getMetadataRootFolder,
            analysisType,
            'config.json'
          );

          const isConfigFile = await FileHelper.isFileExits(analysisConfigFilePath);

          let configFile;
          let configFileError;

          if (!isConfigFile) {
            try {
              await FileHelper.writeJSONFile(analysisConfigFilePath, dataConfig);
            } catch (error) {
              configFileError = error;
            }
          } else {
            try {
              configFile = await FileHelper.parseJSONFile(
                path.join(analysisConfigFilePath)
              );
            } catch (error) {
              configFileError = error;
            }
          }

          if (configFileError) {
            loader.toggle();

            const errorOverlay = new ErrorOverlay({
              message: 'Internal error',
              details: 'cannot process analysis configuration',
              interact: true,
              redirect: 'data-discovering'
            });

            errorOverlay.show();
            return;
          }

          let proceedRequest = true;
          let isOverride = false;

          if (!(configFile === undefined)) {
            const isConfigComparable = ObjectHelper.deepCompare(dataConfig, configFile);

            if (!isConfigComparable) {
              loader.toggle();

              isOverride = await triggerOverridePopup(
                'Override with the new configuration?',
                `The data for the analysis were processed using a different configuration. If you choose to override these data with the new configuration, everything that was done previously will be permanently lost`
              );

              loader.toggle({ message: 'Discovering data...' });

              if (isOverride) {
                try {
                  await metadata.cleanParticipantMetadata(analysisType, []);

                  for (const participant of participants) {
                    await metadata.createMetadataParticipantFolder(
                      analysisType,
                      participant
                    );
                  }

                  await FileHelper.writeJSONFile(analysisConfigFilePath, dataConfig);
                } catch (error) {
                  configFileError = error;
                }
              } else {
                sessionStorage.removeItem('analysis');
                proceedRequest = false;
              }

              if (configFileError) {
                loader.toggle();

                const errorOverlay = new ErrorOverlay({
                  message: 'Internal error',
                  details: 'cannot process analysis configuration',
                  interact: true,
                  redirect: 'data-discovering'
                });

                errorOverlay.show();
                return;
              }
            }
          }

          if (proceedRequest) {
            let requestConfiguration;
            let requestConfigurationError;

            try {
              requestConfiguration =
                await configuration.getRequestConfigurationByAnalysis(analysisType);
            } catch (error) {
              requestConfigurationError = error;
            }

            if (requestConfigurationError === undefined) {
              try {
                const request = await fetchParticipantIMUData(
                  dataPath,
                  analysisType,
                  participants,
                  isOverride,
                  requestConfiguration
                );

                const response = await request.json();

                if (!(response.code === 201)) {
                  loader.toggle();

                  const errorOverlay = new ErrorOverlay({
                    message: response.payload.message,
                    details: response.payload.details,
                    interact: true,
                    redirect: 'data-discovering'
                  });

                  errorOverlay.show();
                } else {
                  router.switchPage('participants-selection');
                }
              } catch (error) {
                loader.toggle();

                const errorOverlay = new ErrorOverlay({
                  message: `The application cannot fetch information of participants`,
                  details: error.message,
                  interact: true,
                  redirect: 'data-discovering'
                });

                errorOverlay.show();

                return;
              }
            } else {
              loader.toggle();

              const errorOverlay = new ErrorOverlay({
                message: `Internal Error`,
                details: requestConfigurationError.message,
                interact: true,
                redirect: 'data-discovering'
              });

              errorOverlay.show();
            }
          } else {
            router.switchPage('data-discovering');
          }
        } else {
          loader.toggle();

          const errorOverlay = new ErrorOverlay({
            message: `No participants could be found`,
            details: `please ensure that the HPF data has been converted properly`,
            interact: true,
            redirect: redirectConverter
          });

          errorOverlay.show();
        }
      }
    }
  }
});
