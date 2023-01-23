import '../styles/angles-selection.css';

import Chart from 'chart.js/auto';
import { CrosshairPlugin } from 'chartjs-plugin-crosshair';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';
import { Metadata } from './components/metadata';
import { ChartSetup } from './utils/chart-setup';
import { ChartHelper } from './helpers/chart-helper.js';
import { DataHelper } from './helpers/data-helper.js';
import { PathHelper } from './helpers/path-helper.js';
// import { FileHelper } from './helpers/file-helper';

// const path = nw.require('path');

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();
const additionalButton = document.querySelectorAll('.app > div[class*=-btn]');
menu.init(additionalButton);

Chart.register(CrosshairPlugin);

const selectedParticipants = sessionStorage.getItem('selected-participants').split(',');
const analysisType = sessionStorage.getItem('analysis');
const dataPath = sessionStorage.getItem('data-path');

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

const inputDataPath = PathHelper.sanitizePath(dataPath);
const metadata = new Metadata(inputDataPath);

if ('selected-points' in sessionStorage) {
  sessionStorage.removeItem('selected-points');
}

const checkSelectedPoints = () => {
  const sessionPoints = sessionStorage.getItem('selected-points');

  if (!(sessionPoints === null)) {
    if (sessionPoints.split(';').length === 2) {
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', '');
    }
  } else {
    submitButton.setAttribute('disabled', '');
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
    }
  } else {
    if (rawActivePoint.x === 0 || rawActivePoint.x === datasetRaw.data[1].x) {
      const activeSelectedPoint = getActivePoint(event, datasetSelected);

      datasetSelected.data = datasetSelected.data.filter(point => {
        return point.x !== activeSelectedPoint.x;
      });

      nbSelectedPoints--;
      removeSessionPoint(activeSelectedPoint.x, activeSelectedPoint.y, true);
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

      removeSessionPoint(rawActivePoint.x, rawActivePoint.y, true);
      addSessionPoint(rawActivePoint.x, rawActivePoint.y);
    }
  }

  plot.update();
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

// const file = await FileHelper.parseJSONFile(
//   path.normalize('small_angles_5507_Ext_genou_Rep_1.3.json')
// );

// ChartSetup.data.datasets[0].data = file;
ChartSetup.data.datasets[0].data = DataHelper.generateSyntheticData();
ChartSetup.data.datasets[1].data = [];

let currentParticipant = 0;
let currentIteration = 0;

if (!(analysisType === null)) {
  infoAnalysis.innerText = analysisType;
}

const updateInfos = () => {
  infoParticipant.innerText = selectedParticipants[currentParticipant];
  infoIteration.innerText = `Iter. ${currentIteration + 1}`;

  if (currentIteration > 0) {
    pagerDots[currentIteration - 1].classList.toggle('active');
  } else {
    pagerDots[pagerDots.length - 1].classList.remove('active');
  }

  pagerDots[currentIteration].classList.toggle('active');

  if (currentIteration === 2 && currentParticipant + 1 === selectedParticipants.length) {
    submitButton.innerText = `Terminer`;
    submitButton.classList.add('completed');
  }
};

const autoAngleButtonClickHandler = event => {
  /**
   * TODO
   */
};

const displayAutoAnglesButton = async () => {
  const participant = selectedParticipants[currentParticipant];
  const participantsInfos = await metadata.getParticipantInfo(analysisType, participant);
  const isHidden = autoAnglesButton.classList.contains('top-btn-disabled');

  if (participantsInfos.auto_angles) {
    if (isHidden) {
      autoAnglesButton.classList.remove('top-btn-disabled');
    }

    autoAnglesButton.addEventListener('click', autoAngleButtonClickHandler);
  } else {
    if (!isHidden) {
      autoAnglesButton.classList.add('top-btn-disabled');
    }

    autoAnglesButton.removeEventListener('click', autoAngleButtonClickHandler);
  }
};

updateInfos();
checkSelectedPoints();
await displayAutoAnglesButton();

const plot = new Chart(chartContext, ChartSetup);
plot.data.datasets[0].pointBackgroundColor = plot.data.datasets[0].data.map(() => {
  return '#16A085';
});

const checkForMetadataExistingPoints = async () => {
  const infos = await metadata.getParticipantInfo(
    PathHelper.sanitizePath(analysisType),
    selectedParticipants[currentParticipant]
  );

  const iterations = infos.iterations;

  if (iterations) {
    if (iterations[currentIteration + 1]) {
      const points = iterations[currentIteration + 1].points;
      const pointAx = points.manual[0].x;
      const pointBx = points.manual[1].x;
      const pointAy = points.manual[0].y;
      const pointBy = points.manual[1].y;

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
            plot.data.datasets[0].pointBackgroundColor[i] = '#FF5722';
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
  const points = sessionStorage.getItem('selected-points');
  const pointsArray = points.split(';');

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

  for (const point of pointsArray) {
    const pointArray = point.split(',');
    let pointsObject;

    if (auto) {
      pointsObject = pointsObjectAll.points.auto;
    } else {
      pointsObject = pointsObjectAll.points.manual;
    }

    if (pointsObject[0].x === null && pointsObject[0].y === null) {
      pointsObject[0].x = pointArray[0];
      pointsObject[0].y = pointArray[1];
    } else {
      if (pointsObject[0].x > pointArray[0]) {
        pointsObject[1].x = pointsObject[0].x;
        pointsObject[1].y = pointsObject[0].y;
        pointsObject[0].x = pointArray[0];
        pointsObject[0].y = pointArray[1];
      } else {
        pointsObject[1].x = pointArray[0];
        pointsObject[1].y = pointArray[1];
      }
    }
  }

  iterationObject.iterations[iteration] = pointsObjectAll;

  return iterationObject;
};

const writeMetadata = async data => {
  const participant = selectedParticipants[currentParticipant];
  await metadata.writeContent(analysisType, participant, data);
};

allData = plot.data.datasets[0].data;
const loadNextChart = async data => {
  checkSelectedPoints();

  plot.data.datasets[0].pointBackgroundColor = plot.data.datasets[0].data.map(() => {
    return '#16A085';
  });

  nbSelectedPoints = 0;
  firstElementZoom = null;
  allData = data;

  plot.data.datasets[0].data = allData;
  plot.update();

  if (currentIteration < 2) {
    currentIteration++;
  } else {
    currentIteration = 0;
    currentParticipant++;
  }

  await checkForMetadataExistingPoints();
  updateInfos();
};

submitButton.addEventListener('click', async () => {
  const formattedAngles = getPointsObject();
  await writeMetadata(formattedAngles);
  sessionStorage.removeItem('selected-points');

  if (submitButton.classList.contains('completed')) {
    loaderOverlay.toggle({ message: 'Saving data...' });
    await writeMetadata({ completed: true });
    sessionStorage.removeItem('selected-participants');

    setTimeout(() => {
      router.switchPage('participants-selection');
    }, 1000);
  } else {
    await displayAutoAnglesButton();
    await loadNextChart(DataHelper.generateSyntheticData());
  }
});

resetButton.addEventListener('click', () => {
  sessionStorage.removeItem('selected-points');
  sessionStorage.removeItem('selected-participants');
  router.switchPage('participants-selection');
});
