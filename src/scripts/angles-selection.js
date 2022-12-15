import '../styles/angles-selection.css';

import Chart from 'chart.js/auto';
import { CrosshairPlugin } from 'chartjs-plugin-crosshair';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';
import { ChartSetup } from './utils/chart-setup';
import { ChartHelper } from './helpers/chart-helper.js';
import { DataHelper } from './helpers/data-helper.js';

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();
const additionalButton = document.querySelector('.auto-angles-btn');
menu.init(additionalButton);

Chart.register(CrosshairPlugin);

const resetButton = document.querySelector('button[type="reset"]');

resetButton.addEventListener('click', () => {
  sessionStorage.removeItem('selected-angles');
  sessionStorage.removeItem('participants');
  router.switchPage('participants-selection');
});

const participants = sessionStorage.getItem('participants').split(',');
const analysis = sessionStorage.getItem('analysis');
const infoParticipant = document.getElementById('participant');
const infoAnalysis = document.getElementById('analysis');
const infoIteration = document.getElementById('iteration');
const chartContext = document.getElementById('chart').getContext('2d');
const pagerDots = document.querySelector('.pager').children;
const submitButton = document.querySelector('button[type="submit"]');

let allData = null;
let nbSelectedPoints = 0;
let firstElementZoom = null;

const checkSelectedAngles = () => {
  const sessionAngles = sessionStorage.getItem('selected-angles');

  if (!(sessionAngles === null)) {
    if (sessionAngles.split(';').length === 2) {
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', '');
    }
  } else {
    submitButton.setAttribute('disabled', '');
  }
};

const addSessionAngle = (x, y) => {
  let sessionAngles = sessionStorage.getItem('selected-angles');

  if (sessionAngles === null) {
    sessionStorage.setItem('selected-angles', `${x},${y}`);
  } else {
    sessionAngles += `;${x},${y}`;
    sessionStorage.setItem('selected-angles', sessionAngles);
  }

  checkSelectedAngles();
};

const removeSessionAngle = (x, y, nearest = false) => {
  const sessionAngles = sessionStorage.getItem('selected-angles');

  if (!(sessionAngles === null)) {
    const angles = sessionAngles.split(';');
    let nearestAngle = [];

    for (const angle of angles) {
      const points = angle.split(',');

      if (!nearest) {
        if (!points.includes(x) && !points.includes(y)) {
          sessionStorage.setItem('selected-angles', points.join(','));
        }
      } else {
        if (nearestAngle.length > 0) {
          if (Math.abs(points[0] - x) > Math.abs(nearestAngle[0] - x)) {
            nearestAngle = [];
            nearestAngle.push(points[0], points[1]);
          }
        } else {
          nearestAngle.push(points[0], points[1]);
        }
      }
    }

    if (nearest) {
      sessionStorage.setItem('selected-angles', nearestAngle.join(','));
    }
  }

  checkSelectedAngles();
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
      addSessionAngle(x, y);
    } else {
      dataset.pointBackgroundColor[index] = '#16A085';
      nbSelectedPoints--;
      sessionStorage.removeItem('selected-angles');
    }
  } else {
    if (dataset.pointBackgroundColor[index] === '#FF5722') {
      dataset.pointBackgroundColor[index] = '#16A085';
      nbSelectedPoints--;
      removeSessionAngle(x, y);
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

      removeSessionAngle(x, y, true);
      addSessionAngle(x, y);
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
  infoParticipant.innerText = participants[currentParticipant];
  infoIteration.innerText = `Iter. ${currentIteration + 1}`;

  if (currentIteration > 0) {
    pagerDots[currentIteration - 1].classList.toggle('active');
  } else {
    pagerDots[pagerDots.length - 1].classList.remove('active');
  }

  pagerDots[currentIteration].classList.toggle('active');

  if (currentIteration === 2 && currentParticipant + 1 === participants.length) {
    submitButton.innerText = `Terminer`;
    submitButton.classList.add('completed');
  }
};

updateInfos();
checkSelectedAngles();

const plot = new Chart(chartContext, ChartSetup);

plot.data.datasets[0].pointBackgroundColor = plot.data.datasets[0].data.map(() => {
  return '#16A085';
});

allData = plot.data.datasets[0].data;

const loadNextChart = data => {
  sessionStorage.removeItem('selected-angles');
  checkSelectedAngles();

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

submitButton.addEventListener('click', () => {
  if (submitButton.classList.contains('completed')) {
    loaderOverlay.toggle({ message: 'Saving data...' });
    sessionStorage.setItem('results-available', true);
    sessionStorage.removeItem('selected-angles');

    setTimeout(() => {
      router.switchPage('participants-selection');
    }, 2000);
  } else {
    loadNextChart(DataHelper.generateSyntheticData());
  }
});
