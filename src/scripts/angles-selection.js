import '../styles/angles-selection.css';

import alert from '../views/partials/components/alert.hbs';

import Chart from 'chart.js/auto';
import { CrosshairPlugin } from 'chartjs-plugin-crosshair';

import Swal from 'sweetalert2';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';
import { Metadata } from './utils/metadata.js';
import { ChartSetup } from './utils/chart-setup';
import { ChartHelper } from './helpers/chart-helper.js';
import { PathHelper } from './helpers/path-helper.js';
import { FileHelper } from './helpers/file-helper';
import { ErrorOverlay } from './components/overlay';
import { Configuration } from './utils/configuration.js';
import { StringHelper } from './helpers/string-helper';
import { Switch } from './utils/switch';
import { SessionStore } from './utils/session-store';

const path = nw.require('path');
const fs = nw.require('fs');

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();
const configuration = await Configuration.load();

const menu = new Menu();
const additionalButton = document.querySelectorAll('.app > div[class*=-btn]');
menu.init(additionalButton);

const dataSwitchRadios = Switch.init('data');

Chart.register(CrosshairPlugin);

const selectedParticipants = sessionStorage
  .getItem('selected-participants')
  .toString()
  .split(',');

const analysisType = sessionStorage.getItem('analysis').toString();
const dataPath = sessionStorage.getItem('data-path').toString();
const stage = sessionStorage.getItem('stage').toString();

const autoAnglesButton = document.querySelector('div.auto-angles-btn');
const infoParticipant = document.getElementById('participant');
const infoAnalysis = document.getElementById('analysis');
const infoIteration = document.getElementById('iteration');
const chartContext = document.getElementById('chart').getContext('2d');
const pagerDots = document.querySelector('.pager').children;
const submitButton = document.querySelector('button[type="submit"]');
const resetButton = document.querySelector('button[type="reset"]');

let allData = null;
let nbSelectedPoints = 0;
let firstElementZoom = null;
let currentParticipant = 0;
let currentIteration = 0;
let autoAngles = [];

const inputDataPath = PathHelper.sanitizePath(dataPath);
const metadata = new Metadata(inputDataPath);

if (!(analysisType === null)) {
  infoAnalysis.innerText = `${analysisType} (${stage})`;
}

if ('selected-points' in sessionStorage) {
  sessionStorage.removeItem('selected-points');
}

const toggleAlert = message => {
  const dataSwitch = document
    .getElementById('group-data')
    .querySelector('.input-container');

  if (!(message === undefined)) {
    dataSwitch.insertAdjacentHTML('beforeend', alert({ message }));
  } else {
    const alert = document.getElementById('warning-msg');

    if (!(alert === null)) {
      alert.remove();
    }
  }
};

if ('data' in sessionStorage) {
  const data = sessionStorage.getItem('data');

  if (data === 'filtered') {
    toggleAlert(`Angles cannot be selected manually on filtered data`);
  } else {
    toggleAlert();
  }
}

const checkSelectedPoints = () => {
  const sessionPoints = sessionStorage.getItem('selected-points');

  if (!(sessionPoints === null)) {
    const sessionPointsArray = sessionPoints.split(';');

    if (sessionPointsArray.length === 2) {
      submitButton.removeAttribute('disabled');
    } else {
      if (autoAngles.length === 2 && !(sessionPointsArray.length === 1)) {
        submitButton.removeAttribute('disabled');
      } else {
        submitButton.setAttribute('disabled', '');
      }
    }
  } else {
    if (autoAngles.length === 2) {
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', '');
    }
  }
};

const addSessionPoint = (x, y) => {
  let sessionPoints = sessionStorage.getItem('selected-points');

  if (sessionPoints === null) {
    sessionStorage.setItem('selected-points', `${x},${y}`);
  } else {
    sessionPoints += `;${x},${y}`;
    sessionStorage.setItem('selected-points', sessionPoints);
  }

  checkSelectedPoints();
};

const removeSessionPoint = (x, y, nearest = false) => {
  const sessionPoints = sessionStorage.getItem('selected-points');

  if (!(sessionPoints === null)) {
    const pointsArray = sessionPoints.split(';');
    let nearestPoint = [];

    for (const point of pointsArray) {
      const pointArray = point.split(',');

      if (!nearest) {
        if (!pointArray.includes(x) && !pointArray.includes(y)) {
          sessionStorage.setItem('selected-points', pointArray.join(','));
        }
      } else {
        if (nearestPoint.length > 0) {
          if (Math.abs(pointArray[0] - x) > Math.abs(nearestPoint[0] - x)) {
            nearestPoint = [];
            nearestPoint.push(pointArray[0], pointArray[1]);
          }
        } else {
          nearestPoint.push(pointArray[0], pointArray[1]);
        }
      }
    }

    if (nearest) {
      sessionStorage.setItem('selected-points', nearestPoint.join(','));
    }
  }

  checkSelectedPoints();
};

const getActivePoint = (event, dataset) => {
  const activePoint = plot.getElementsAtEventForMode(
    event,
    'nearest',
    { intersect: false, axis: 'x' },
    true
  );

  let index = activePoint[0].index;

  if (!(firstElementZoom === null)) {
    index = firstElementZoom + (index - 1);
  }

  return { index, x: dataset.data[index].x, y: dataset.data[index].y };
};

const chartBeforeZoomHandler = (start, end) => {
  firstElementZoom = allData?.findIndex(value => {
    if (value.x >= start) {
      return true;
    }

    return false;
  });

  return true;
};

const chartAfterZoomHandler = (start, end) => {
  plot.update();
};

const chartPointOnClickHandler = (event, element, plot) => {
  if (plot.data.datasets[1].pointBackgroundColor === '#3949AB') {
    plot.data.datasets[1].pointBackgroundColor = '#FF5722';

    if (autoAnglesButton.classList.contains('top-btn-disabled')) {
      autoAnglesButton.classList.remove('top-btn-disabled');
    }

    if (!('selected-points' in sessionStorage)) {
      sessionStorage.setItem('selected-points', autoAngles.join(';'));
      autoAngles = [];
    }
  }

  if (element.length > 0 && element[0].datasetIndex < 2) {
    const datasetRaw = plot.data.datasets[0];
    const datasetSelected = plot.data.datasets[1];
    const rawActivePoint = getActivePoint(event, datasetRaw);

    if (nbSelectedPoints < 2) {
      if (!(rawActivePoint.x === 0)) {
        datasetSelected.data.push(datasetRaw.data[rawActivePoint.index]);
        nbSelectedPoints++;
        addSessionPoint(rawActivePoint.x, rawActivePoint.y);
      } else {
        const activeSelectedPoint = getActivePoint(event, datasetSelected);

        datasetSelected.data = datasetSelected.data.filter(point => {
          return point.x !== activeSelectedPoint.x;
        });

        nbSelectedPoints--;
        sessionStorage.removeItem('selected-points');
        checkSelectedPoints();
      }
    } else {
      if (rawActivePoint.x === 0 || rawActivePoint.x === datasetRaw.data[1].x) {
        const activeSelectedPoint = getActivePoint(event, datasetSelected);

        datasetSelected.data = datasetSelected.data.filter(point => {
          return point.x !== activeSelectedPoint.x;
        });

        nbSelectedPoints--;
        removeSessionPoint(
          activeSelectedPoint.x.toString(),
          activeSelectedPoint.y.toString(),
          true
        );
      } else {
        const sortedSelectedPoints = datasetSelected.data.sort((a, b) => {
          if (a.x < b.x) {
            return -1;
          }

          if (a.x > b.x) {
            return 1;
          }
          return 0;
        });

        const firstSelectedIndex = datasetRaw.data.findIndex(
          point => point.x === sortedSelectedPoints[0].x
        );

        const secondSelectedIndex = datasetRaw.data.findIndex(
          point => point.x === sortedSelectedPoints[1].x
        );

        const distToFirst = Math.abs(firstSelectedIndex - rawActivePoint.index);
        const distToSecond = Math.abs(secondSelectedIndex - rawActivePoint.index);

        if (distToFirst < distToSecond) {
          datasetSelected.data = [sortedSelectedPoints[1]];
        } else {
          datasetSelected.data = [sortedSelectedPoints[0]];
        }

        datasetSelected.data.push(datasetRaw.data[rawActivePoint.index]);

        removeSessionPoint(
          rawActivePoint.x.toString(),
          rawActivePoint.y.toString(),
          true
        );
        addSessionPoint(rawActivePoint.x, rawActivePoint.y);
      }
    }

    plot.update();
  }
};

ChartSetup.options.onClick = (event, element, plot) => {
  chartPointOnClickHandler(event, element, plot);
};

ChartSetup.options.plugins.crosshair = {
  ...ChartSetup.options.plugins.crosshair,
  callbacks: {
    beforeZoom: () => (start, end) => {
      chartBeforeZoomHandler(start, end);
    },
    afterZoom: () => (start, end) => {
      chartAfterZoomHandler(start, end);
    }
  }
};

ChartSetup.data.datasets[0].backgroundColor =
  ChartHelper.generateChartGradient(chartContext);

const getAngleFiles = async (filtered = false) => {
  const angleFiles = [];

  for (const selectedParticipant of selectedParticipants) {
    let inputPath;
    try {
      inputPath = await metadata.getParticipantFolderPath(
        analysisType,
        selectedParticipant,
        {
          fromSession: true
        }
      );
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Cannot find files for participant ${selectedParticipant}`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }

    let files;
    try {
      files = await FileHelper.listAllFiles(PathHelper.sanitizePath(inputPath));
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Cannot find chart data`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }

    angleFiles.push(
      files
        .filter(file => {
          const fileArray = file.split('.');

          if (fileArray[fileArray.length - 1] === 'json') {
            const fileArray = file.split('_');

            if (fileArray.includes('angle')) {
              const fileNameFilter = filtered ? 'filtered' : 'small';

              if (fileArray.includes(fileNameFilter)) {
                return true;
              }
            }
          }

          return false;
        })
        .map(file => path.join(inputPath, file))
    );
  }

  return angleFiles;
};

const initData = async angleFiles => {
  let angleFile;

  try {
    angleFile = await FileHelper.parseJSONFile(
      PathHelper.sanitizePath(angleFiles[currentParticipant][currentIteration])
    );
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Cannot read data of participant ${
        selectedParticipants[currentParticipant]
      } for the iteration#${currentIteration + 1}`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  const selectedAngles = ChartSetup.data.datasets[1].data;
  if (!(selectedAngles === undefined) && selectedAngles.length === 2) {
    if ('data' in sessionStorage) {
      const selectedAnglesIndexes = [];

      for (const selectedAngle of selectedAngles) {
        selectedAnglesIndexes.push(
          ChartSetup.data.datasets[0].data.findIndex(
            element => element.x === selectedAngle.x
          )
        );
      }

      const selectedAnglesData = [];

      for (const selectedAnglesIndex of selectedAnglesIndexes) {
        selectedAnglesData.push(angleFile[selectedAnglesIndex]);
      }

      ChartSetup.data.datasets[1].data = selectedAnglesData;
    }
  }

  ChartSetup.data.datasets[0].data = angleFile;
};

const angleFiles = await getAngleFiles();
await initData(angleFiles);
ChartSetup.data.datasets[1].data = [];

const updateInfos = () => {
  infoParticipant.innerText = selectedParticipants[currentParticipant];
  infoIteration.innerText = `Iter. ${currentIteration + 1}`;

  if (currentIteration > 0) {
    pagerDots[currentIteration - 1].classList.toggle('active');
  } else {
    pagerDots[pagerDots.length - 1].classList.remove('active');
  }

  pagerDots[currentIteration].classList.toggle('active');

  if (
    currentIteration === angleFiles[currentParticipant].length - 1 &&
    currentParticipant + 1 === selectedParticipants.length
  ) {
    const buttonLabel = submitButton.querySelector('span.submit-label');
    buttonLabel.innerText = `Complete`;
    submitButton.classList.add('completed');
  }
};

const processAutoAngles = async (participant, override) => {
  let response;

  try {
    const port = localStorage.getItem('port') ?? configuration.PORT;

    const request = await fetch(`http://${configuration.HOST}:${port}/api/points/`, {
      headers: {
        'X-API-Key': configuration.API_KEY,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        data_path: PathHelper.sanitizePath(dataPath),
        analysis: analysisType,
        stage,
        participant: StringHelper.revertParticipantNameFromSession(participant),
        iteration: currentIteration
      })
    });

    response = await request.json();
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Automatic selection of points failed`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  const points = response.payload.points;

  const formattedPoints = [];

  for (const point of points) {
    formattedPoints.push({ x: Number(point.x), y: Number(point.y) });
    autoAngles.push(`${Number(point.x)},${Number(point.y)}`);
  }

  const formattedPointsIndexes = [];

  for (const formattedPoint of formattedPoints) {
    formattedPointsIndexes.push(
      plot.data.datasets[0].data.findIndex(element => element.x === formattedPoint.x)
    );
  }

  const formattedPointsData = [];

  for (const formattedPointsIndex of formattedPointsIndexes) {
    formattedPointsData.push(plot.data.datasets[0].data[formattedPointsIndex]);
  }

  plot.data.datasets[1].data = formattedPointsData;
  plot.data.datasets[1].pointBackgroundColor = '#3949AB';
  nbSelectedPoints = 2;

  plot.update();
  autoAnglesButton.classList.add('top-btn-disabled');

  const formattedAngles = getPointsObject(true);
  await writeMetadata(formattedAngles, override);
  submitButton.removeAttribute('disabled');
};

const autoAngleButtonClickHandler = async (participant, event) => {
  const isAutoAnglesDisplayed = plot.data.datasets[1].pointBackgroundColor === '#3949AB';

  if (!isAutoAnglesDisplayed && 'selected-points' in sessionStorage) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Manually selected points will be overwritten by the automatic selection',
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
          await processAutoAngles(participant, true);
        }
      })
      .catch(error => {
        throw new Error(error);
      });
  } else {
    await processAutoAngles(participant);
  }
};

const displayAutoAnglesButton = async () => {
  const participant = selectedParticipants[currentParticipant];

  let participantsInfos;

  try {
    participantsInfos = await metadata.getParticipantInfo(analysisType, participant);
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Participant ${participant} cannot be processed`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  const isHidden = autoAnglesButton.classList.contains('top-btn-disabled');

  let state;

  if (participantsInfos.auto_angles) {
    if (isHidden) {
      autoAnglesButton.classList.remove('top-btn-disabled');
      state = true;
    }
  } else {
    if (!isHidden) {
      autoAnglesButton.classList.add('top-btn-disabled');
      state = false;
    }
  }

  return state;
};

updateInfos();
checkSelectedPoints();
const isDisplayed = await displayAutoAnglesButton();

if (currentIteration === 0 && isDisplayed) {
  autoAnglesButton.addEventListener('click', event =>
    autoAngleButtonClickHandler(selectedParticipants[currentParticipant], event)
  );
}

const plot = new Chart(chartContext, ChartSetup);
plot.data.datasets[0].pointBackgroundColor = plot.data.datasets[0].data.map(() => {
  return '#16A085';
});

const checkForMetadataExistingPoints = async () => {
  let infos;

  try {
    infos = await metadata.getParticipantInfo(
      PathHelper.sanitizePath(analysisType),
      selectedParticipants[currentParticipant]
    );
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Participant ${selectedParticipants[currentParticipant]} cannot be processed`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  const iterations = infos.stages[stage].iterations;

  if (iterations) {
    if (iterations[currentIteration + 1]) {
      const pointsObject = iterations[currentIteration + 1].points;

      let isManualPointsExist = true;

      const manualPoints = Object.values(pointsObject.manual);

      for (let i = 0; i < manualPoints.length; i++) {
        const manualPoint = manualPoints[i];

        if (manualPoint.x === null && manualPoint.y === null) {
          isManualPointsExist = false;
        }
      }

      const points = isManualPointsExist ? pointsObject.manual : pointsObject.auto;

      const pointAx = points[0].x;
      const pointBx = points[1].x;
      const pointAy = points[0].y;
      const pointBy = points[1].y;

      if (pointAx && pointAy && pointBx && pointBy) {
        const plottedPoints = plot.data.datasets[0].data;

        for (let i = 0; i < plottedPoints.length; i++) {
          const plottedPoint = plottedPoints[i];

          if (plottedPoint.x === Number(pointAx) || plottedPoint.x === Number(pointBx)) {
            if ('selected-points' in sessionStorage) {
              sessionStorage.removeItem('selected-points');
            }

            sessionStorage.setItem(
              'selected-points',
              `${pointAx},${pointAy};${pointBx},${pointBy}`
            );

            nbSelectedPoints = 2;
            plot.data.datasets[1].data.push({ x: plottedPoint.x, y: plottedPoint.y });

            if (!isManualPointsExist) {
              plot.data.datasets[1].pointBackgroundColor = '#3949AB';

              if (!autoAnglesButton.classList.contains('top-btn-disabled')) {
                autoAnglesButton.classList.add('top-btn-disabled');
              }
            } else {
              plot.data.datasets[1].pointBackgroundColor = '#FF5722';
            }
          }
        }

        plot.update();
        checkSelectedPoints();
      }
    }
  }
};

await checkForMetadataExistingPoints();

const getPointsObject = (auto = false) => {
  const iteration = currentIteration + 1;
  const iterationObject = {
    iterations: {}
  };

  const pointsObjectAll = {
    points: {
      manual: {
        0: { x: null, y: null },
        1: { x: null, y: null }
      },
      auto: {
        0: { x: null, y: null },
        1: { x: null, y: null }
      }
    }
  };

  let pointsArray = [];

  if (auto) {
    if (autoAngles.length > 0) {
      pointsArray = autoAngles;
    } else {
      const errorOverlay = new ErrorOverlay({
        message: 'Internal Error',
        details: 'Cannot use provided angles',
        interact: true
      });

      errorOverlay.show();
    }
  } else {
    if ('selected-points' in sessionStorage) {
      const points = sessionStorage.getItem('selected-points').toString();
      pointsArray = points.split(';');
    } else {
      const errorOverlay = new ErrorOverlay({
        message: 'Internal Error',
        details: 'Cannot use provided angles',
        interact: true
      });

      errorOverlay.show();
    }
  }

  for (const point of pointsArray) {
    const pointArray = point.split(',');
    let pointsObject;

    if (auto) {
      pointsObject = pointsObjectAll.points.auto;
    } else {
      pointsObject = pointsObjectAll.points.manual;
    }

    if (pointsObject[0].x === null && pointsObject[0].y === null) {
      pointsObject[0].x = Number(pointArray[0]);
      pointsObject[0].y = Number(pointArray[1]);
    } else {
      if (Number(pointsObject[0].x) > Number(pointArray[0])) {
        pointsObject[1].x = Number(pointsObject[0].x);
        pointsObject[1].y = Number(pointsObject[0].y);
        pointsObject[0].x = Number(pointArray[0]);
        pointsObject[0].y = Number(pointArray[1]);
      } else {
        pointsObject[1].x = Number(pointArray[0]);
        pointsObject[1].y = Number(pointArray[1]);
      }
    }
  }

  iterationObject.iterations[iteration] = pointsObjectAll;

  return iterationObject;
};

const writeMetadata = async (data, override = false) => {
  const participant = selectedParticipants[currentParticipant];

  try {
    await metadata.writeContent(analysisType, participant, data, stage, override);
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Information for participant ${participant} cannot be saved`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }
};

const getFormattedPointsFromSession = () => {
  const points = sessionStorage.getItem('selected-points').toString();
  const pointsArray = points.split(';');

  if (Number(pointsArray[0].split(',')[0]) > Number(pointsArray[1].split(',')[0])) {
    return {
      point1x: Number(pointsArray[1].split(',')[0]),
      point2x: Number(pointsArray[0].split(',')[0])
    };
  } else {
    return {
      point1x: Number(pointsArray[0].split(',')[0]),
      point2x: Number(pointsArray[1].split(',')[0])
    };
  }
};

const postAnglesData = async (participant, iteration, point1x, point2x) => {
  const port = localStorage.getItem('port') ?? configuration.PORT;

  return await fetch(`http://${configuration.HOST}:${port}/api/data/emg/`, {
    headers: {
      'X-API-Key': configuration.API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      window_size: Number(localStorage.getItem('window-size')),
      data_path: PathHelper.sanitizePath(dataPath),
      analysis: analysisType,
      stage,
      participant,
      iteration,
      point_1x: Number(point1x),
      point_2x: Number(point2x)
    })
  });
};

const fetchResults = async participants => {
  return await fetch(`http://${configuration.HOST}:${configuration.PORT}/api/results/`, {
    headers: {
      'X-API-Key': configuration.API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      data_path: PathHelper.sanitizePath(dataPath),
      analysis: analysisType,
      stage,
      participants
    })
  });
};

allData = plot.data.datasets[0].data;

for (const dataSwitchRadio of dataSwitchRadios) {
  dataSwitchRadio.addEventListener('change', async event => {
    let angleFiles;

    if (dataSwitchRadio.value === 'raw') {
      toggleAlert();

      angleFiles = await getAngleFiles();

      ChartSetup.options.onHover = (event, chart) => {
        event.native.target.style.cursor = chart[0] ? 'pointer' : 'default';
      };

      ChartSetup.options.onClick = (event, element, plot) => {
        chartPointOnClickHandler(event, element, plot);
      };
    } else if (dataSwitchRadio.value === 'filtered') {
      toggleAlert(`Angles cannot be selected manually on filtered data`);

      angleFiles = await getAngleFiles(true);

      ChartSetup.options.onHover = (event, chart) => {
        event.native.target.style.cursor = 'default';
      };

      ChartSetup.options.onClick = null;

      const isFilteredDataAlert = JSON.parse(localStorage.getItem('filtered-data-alert'));

      if (isFilteredDataAlert === null || isFilteredDataAlert) {
        Swal.fire({
          title: 'Filtered Data',
          text: `Points will not be manually selectable on the filtered data chart. However, the automatic detection feature remains available.`,
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
          confirmButtonText: `Continue notifying`,
          denyButtonText: `Stop notifying next times`
        })
          .then(async result => {
            if (!result.isConfirmed) {
              localStorage.setItem('filtered-data-alert', false);
            } else {
              localStorage.setItem('filtered-data-alert', true);
            }
          })
          .catch(error => {
            throw new Error(error);
          });
      }
    }

    await initData(angleFiles);
    plot.update();
  });
}

const mutexLock = async () => {
  const participant = StringHelper.revertParticipantNameFromSession(
    selectedParticipants[currentParticipant]
  );

  const participantMetadataPath = await metadata.getParticipantFolderPath(
    analysisType,
    selectedParticipants[currentParticipant],
    { fromSession: true }
  );

  const metadataRootPath = path.parse(participantMetadataPath).dir;

  try {
    await fs.promises.access(
      path.join(metadataRootPath, `${participant}.lock`),
      fs.constants.F_OK
    );

    Swal.fire({
      title: `Conflict detected`,
      text: `Another user is currently working on the participant ${participant}. You cannot process this participant at the same time, as this could compromise the data.`,
      icon: 'warning',
      background: '#ededed',
      customClass: {
        confirmButton: 'button-popup cancel'
      },
      buttonsStyling: false,
      allowOutsideClick: false,
      showCancelButton: false,
      showDenyButton: false,
      confirmButtonText: `Skip participant ${participant}`
    })
      .then(async result => {
        if (result.isConfirmed) {
          selectedParticipants.splice(currentParticipant, 1);
          infoParticipant.innerText = selectedParticipants[currentParticipant];
          await mutexLock();
        }
      })
      .catch(error => {
        throw new Error(error);
      });
  } catch (error) {
    try {
      await fs.promises.writeFile(
        PathHelper.sanitizePath(path.join(metadataRootPath, `${participant}.lock`)),
        ''
      );
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Participant ${participant} cannot be processed`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }
  }
};

const mutexUnlock = async () => {
  const participant = StringHelper.revertParticipantNameFromSession(
    selectedParticipants[currentParticipant]
  );

  const participantMetadataPath = await metadata.getParticipantFolderPath(
    analysisType,
    selectedParticipants[currentParticipant],
    { fromSession: true }
  );

  const metadataRootPath = path.parse(participantMetadataPath).dir;

  try {
    await fs.promises.access(
      path.join(metadataRootPath, `${participant}.lock`),
      fs.constants.F_OK
    );

    try {
      fs.promises.unlink(
        PathHelper.sanitizePath(path.join(metadataRootPath, `${participant}.lock`))
      );
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Participant ${participant} cannot be processed`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Participant ${participant} cannot be processed`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }
};

const loadNextChart = async angleFiles => {
  checkSelectedPoints();

  plot.data.datasets[0].pointBackgroundColor = plot.data.datasets[0].data.map(() => {
    return '#16A085';
  });

  plot.data.datasets[1].data = [];

  nbSelectedPoints = 0;
  firstElementZoom = null;
  autoAngles = [];

  if (currentIteration < angleFiles[currentParticipant].length - 1) {
    currentIteration++;
  } else {
    await writeMetadata({ completed: true });

    const participants = [
      StringHelper.revertParticipantNameFromSession(
        selectedParticipants[currentParticipant]
      )
    ];

    try {
      const request = await fetchResults(participants);
      const response = await request.json();

      if (!(response.code === 201)) {
        const errorOverlay = new ErrorOverlay({
          message: response.payload.message,
          details: response.payload.details,
          interact: true
        });

        errorOverlay.show();
      }
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Application cannot complete processing of selected angles`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }

    await mutexUnlock();

    currentIteration = 0;
    currentParticipant++;

    await mutexLock();
  }

  try {
    allData = await FileHelper.parseJSONFile(
      PathHelper.sanitizePath(angleFiles[currentParticipant][currentIteration])
    );
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Cannot read data of participant ${
        selectedParticipants[currentParticipant]
      } for the iteration#${currentIteration + 1}`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  plot.data.datasets[0].data = allData;
  plot.update();

  await checkForMetadataExistingPoints();
  updateInfos();
};

submitButton.addEventListener('click', async () => {
  submitButton.setAttribute('disabled', '');

  toggleAlert();

  ChartSetup.options.onHover = (event, chart) => {
    event.native.target.style.cursor = chart[0] ? 'pointer' : 'default';
  };

  ChartSetup.options.onClick = (event, element, plot) => {
    chartPointOnClickHandler(event, element, plot);
  };

  const spinner = submitButton.querySelector('span.spinner');
  spinner.classList.toggle('hide');

  let formattedAngles;
  let isAuto = false;

  const isAutoAnglesDisplayed = plot.data.datasets[1].pointBackgroundColor === '#3949AB';

  if (!isAutoAnglesDisplayed && 'selected-points' in sessionStorage) {
    formattedAngles = getPointsObject();
    await writeMetadata(formattedAngles);
  } else if (autoAngles.length > 0 && !('selected-points' in sessionStorage)) {
    isAuto = true;
  }

  try {
    const participant = StringHelper.revertParticipantNameFromSession(
      selectedParticipants[currentParticipant]
    );

    let point1x;
    let point2x;

    if (!isAuto) {
      point1x = getFormattedPointsFromSession().point1x;
      point2x = getFormattedPointsFromSession().point2x;
    } else {
      point1x = Number(autoAngles[0].split(',')[0]);
      point2x = Number(autoAngles[1].split(',')[0]);
    }

    const request = await postAnglesData(participant, currentIteration, point1x, point2x);
    const response = await request.json();

    if (!(response.code === 201)) {
      const errorOverlay = new ErrorOverlay({
        message: response.payload.message,
        details: response.payload.details,
        interact: true
      });

      errorOverlay.show();
    }
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Application cannot process the current selection`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  sessionStorage.removeItem('selected-points');

  if (submitButton.classList.contains('completed')) {
    loaderOverlay.toggle({ message: 'Saving data...' });
    await writeMetadata({ completed: true });
    await mutexUnlock();

    try {
      const participants = selectedParticipants.map(participant =>
        StringHelper.revertParticipantNameFromSession(participant)
      );
      const request = await fetchResults(participants);
      const response = await request.json();

      if (!(response.code === 201)) {
        loaderOverlay.toggle();

        const errorOverlay = new ErrorOverlay({
          message: response.payload.message,
          details: response.payload.details,
          interact: true
        });

        errorOverlay.show();
      } else {
        SessionStore.clear({ keep: ['data-path', 'analysis', 'stage'] });

        setTimeout(() => {
          router.switchPage('participants-selection');
        }, 800);
      }
    } catch (error) {
      loaderOverlay.toggle();

      const errorOverlay = new ErrorOverlay({
        message: `Application cannot complete processing of selected angles`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }
  } else {
    await displayAutoAnglesButton();

    for (const dataSwitchRadio of dataSwitchRadios) {
      if (dataSwitchRadio.value === 'raw') {
        if (!dataSwitchRadio.checked) {
          dataSwitchRadio.checked = true;
        }
      } else if (dataSwitchRadio.value === 'filtered') {
        if (!dataSwitchRadio.checked) {
          dataSwitchRadio.checked = false;
        }
      }
    }

    await loadNextChart(angleFiles);
    spinner.classList.toggle('hide');
  }
});

resetButton.addEventListener('click', async () => {
  await mutexUnlock();
  SessionStore.clear({ keep: ['data-path', 'analysis', 'stage'] });
  router.switchPage('participants-selection');
});
