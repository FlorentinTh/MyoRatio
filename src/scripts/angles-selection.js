import '../styles/angles-selection.css';

import Chart from 'chart.js/auto';
import { CrosshairPlugin } from 'chartjs-plugin-crosshair';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';
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

let nbSelectedPoints = 0;
let firstElementZoom = null;

const gradient = chartContext.createLinearGradient(0, 25, 0, 300);
gradient.addColorStop(0, 'rgba(22, 160, 133, 0.25)');
gradient.addColorStop(0.35, 'rgba(22, 160, 133, 0.15)');
gradient.addColorStop(1, 'rgba(22, 160, 133, 0)');

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
  firstElementZoom = allData.findIndex(value => {
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

const chartSetup = {
  type: 'scatter',
  responsive: true,
  maintainAspectRatio: false,
  options: {
    animation: false,
    parsing: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        displayColors: false,
        padding: 12,
        caretPadding: 16,
        bodyFont: {
          size: 14
        }
      },
      crosshair: {
        sync: {
          enabled: false
        },
        line: {
          color: '#232323dd',
          width: 1,
          dashPattern: [4, 5],
          greyOutBehind: true
        },
        zoom: {
          enabled: false, // if true: issue with point selection onClick
          zoomButtonText: 'Reset',
          zoomButtonClass: 'reset-zoom'
        },
        callbacks: {
          beforeZoom: () => (start, end) => {
            chartBeforeZoomHandler(start, end);
          },
          afterZoom: () => (start, end) => {
            chartAfterZoomHandler(start, end);
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Seconds',
          padding: {
            top: 20
          },
          color: '#16A085',
          font: {
            weight: 'bold',
            size: 14
          }
        },
        ticks: {
          color: '#232323',
          source: 'auto',
          maxRotation: 0,
          autoSkip: true
          // sampleSize: 1
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Degrees',
          padding: {
            bottom: 20
          },
          color: '#16A085',
          font: {
            weight: 'bold',
            size: 14
          }
        },
        ticks: {
          color: '#232323',
          source: 'auto',
          maxRotation: 0,
          autoSkip: true
          // sampleSize: 1
        }
      }
    },
    onHover: (event, chart) => {
      event.native.target.style.cursor = chart[0] ? 'pointer' : 'default';
    },
    onClick: (event, element, plot) => {
      chartPointOnClickHandler(event, element, plot);
    }
  },
  data: {
    datasets: [
      {
        pointBorderWidth: 1,
        pointHoverRadius: 10,
        pointBackgroundColor: '#16A085',
        pointHoverBorderColor: '#232323dd',
        pointHoverBorderWidth: 2,
        pointRadius: 6,
        borderWidth: 5,
        pointStyle: 'circle',
        backgroundColor: gradient,
        borderColor: '#16A085',
        showLine: true,
        fill: true,
        interpolate: true,
        lineTension: 0,
        data: DataHelper.generateSyntheticData()
      }
    ]
  }
};

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

const plot = new Chart(chartContext, chartSetup);

plot.data.datasets[0].pointBackgroundColor = plot.data.datasets[0].data.map(() => {
  return '#16A085';
});

let allData = plot.data.datasets[0].data;

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
