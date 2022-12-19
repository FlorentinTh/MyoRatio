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

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();
const additionalButton = document.querySelectorAll('.app > div[class*=-btn]');
menu.init(additionalButton);

Chart.register(CrosshairPlugin);

const selectedParticipants = sessionStorage.getItem('selected-participants').split(',');
const analysis = sessionStorage.getItem('analysis');
const dataPath = sessionStorage.getItem('data-path');

const autoAnglesButton = document.querySelector('div.auto-angles-btn');
const infoParticipant = document.getElementById('participant');
const infoAnalysis = document.getElementById('analysis');
const infoIteration = document.getElementById('iteration');
const chartContext = document.getElementById('chart').getContext('2d');
const pagerDots = document.querySelector('.pager').children;
const submitButton = document.querySelector('button[type="submit"]');

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
        console.log('HERE');
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
  const dataset = plot.data.datasets[0];
  const { index, x, y } = getActivePoint(event, dataset);

  if (nbSelectedPoints < 2) {
    if (dataset.pointBackgroundColor[index] === '#16A085') {
      dataset.pointBackgroundColor[index] = '#FF5722';
      nbSelectedPoints++;
      addSessionPoint(x, y);
    } else {
      dataset.pointBackgroundColor[index] = '#16A085';
      nbSelectedPoints--;
      sessionStorage.removeItem('selected-points');
    }
  } else {
    if (dataset.pointBackgroundColor[index] === '#FF5722') {
      dataset.pointBackgroundColor[index] = '#16A085';
      nbSelectedPoints--;
      removeSessionPoint(x, y, true);
    } else {
      const firstSelectedIndex = dataset.pointBackgroundColor.indexOf('#FF5722');
      const secondSelectedIndex = dataset.pointBackgroundColor.lastIndexOf('#FF5722');
      const distToFirst = Math.abs(firstSelectedIndex - index);
      const distToSecond = Math.abs(secondSelectedIndex - index);

      if (distToFirst < distToSecond) {
        dataset.pointBackgroundColor[firstSelectedIndex] = '#16A085';
      } else {
        dataset.pointBackgroundColor[secondSelectedIndex] = '#16A085';
      }

      dataset.pointBackgroundColor[index] = '#FF5722';

      removeSessionPoint(x, y, true);
      addSessionPoint(x, y);
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
ChartSetup.data.datasets[0].data = DataHelper.generateSyntheticData();

let currentParticipant = 0;
let currentIteration = 0;

if (!(analysis === null)) {
  infoAnalysis.innerText = analysis;
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

const autoAngleButtonClickHandler = event => {};

const displayAutoAnglesButton = async () => {
  const participant = selectedParticipants[currentParticipant];
  const participantsInfos = await metadata.getParticipantInfo(analysis, participant);
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

const getHandPointsObject = () => {
  const points = sessionStorage.getItem('selected-points');
  const pointsArray = points.split(';');

  const iteration = currentIteration + 1;
  const iterationObject = {
    iterations: {}
  };
  const pointsObject = {
    points: {
      hand: {
        0: { x: undefined, y: undefined },
        1: { x: undefined, y: undefined }
      }
    }
  };

  for (const point of pointsArray) {
    const pointArray = point.split(',');
    const pointsObjectHand = pointsObject.points.hand;

    if (pointsObjectHand[0].x === undefined && pointsObjectHand[0].y === undefined) {
      pointsObjectHand[0].x = pointArray[0];
      pointsObjectHand[0].y = pointArray[1];
    } else {
      if (pointsObjectHand[0].x > pointArray[0]) {
        pointsObjectHand[1].x = pointsObjectHand[0].x;
        pointsObjectHand[1].y = pointsObjectHand[0].y;
        pointsObjectHand[0].x = pointArray[0];
        pointsObjectHand[0].y = pointArray[1];
      } else {
        pointsObjectHand[1].x = pointArray[0];
        pointsObjectHand[1].y = pointArray[1];
      }
    }
  }

  iterationObject.iterations[iteration] = pointsObject;

  return iterationObject;
};

const writeMetadata = async data => {
  const participant = selectedParticipants[currentParticipant];
  await metadata.writeContent(analysis, participant, data);
};

allData = plot.data.datasets[0].data;
const loadNextChart = data => {
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

  updateInfos();
};

submitButton.addEventListener('click', async () => {
  const formattedAngles = getHandPointsObject();
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
    loadNextChart(DataHelper.generateSyntheticData());
  }
});

const resetButton = document.querySelector('button[type="reset"]');

resetButton.addEventListener('click', () => {
  sessionStorage.removeItem('selected-points');
  sessionStorage.removeItem('selected-participants');
  router.switchPage('participants-selection');
});
