import LoaderOverlay from './components/loader-overlay.js';
import Menu from './components/menu.js';
import Router from './utils/router.js';

Router.disableBackButton();

const resetBtn = document.querySelector('button[type="reset"]');

resetBtn.addEventListener('click', () => {
  sessionStorage.removeItem('selected-angles');
  sessionStorage.removeItem('participants');
  Router.switchPage('participants-selection.html');
});

const menuBtns = [];
menuBtns.push(document.querySelector('.auto-angles-btn'));

const menu = new Menu();
menu.init(menuBtns);

const participants = sessionStorage.getItem('participants').split(',');
const analysis = sessionStorage.getItem('analysis');

const infoParticipant = document.getElementById('participant');
const infoAnalysis = document.getElementById('analysis');
const infoIter = document.getElementById('iteration');

const chartCtx = document.getElementById('chart').getContext('2d');

const dots = document.querySelector('.pager').children;
const submitBtn = document.querySelector('button[type="submit"]');

let nbSelectedPoints = 0;
let firstElementZoom = null;

const gradient = chartCtx.createLinearGradient(0, 25, 0, 300);
gradient.addColorStop(0, 'rgba(22, 160, 133, 0.25)');
gradient.addColorStop(0.35, 'rgba(22, 160, 133, 0.15)');
gradient.addColorStop(1, 'rgba(22, 160, 133, 0)');

const conf = {
  type: 'scatter',
  responsive: true,
  maintainAspectRatio: false,
  options: {
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
            firstElementZoom = allData.findIndex(value => {
              if (value.x >= start) {
                return true;
              }

              return false;
            });

            return true;
          },
          afterZoom: () => (start, end) => {
            plot.update();
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
          color: '#232323'
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
          color: '#232323'
        }
      }
    },
    onHover: (event, chart) => {
      event.native.target.style.cursor = chart[0] ? 'pointer' : 'default';
    },
    onClick: (event, element, plot) => {
      const activePoint = plot.getElementsAtEventForMode(
        event,
        'nearest',
        { intersect: false, axis: 'x' },
        true
      );

      const dataset = plot.data.datasets[0];
      let point = activePoint[0].index;

      if (!(firstElementZoom === null)) {
        point = firstElementZoom + (point - 1);
      }

      const dataX = dataset.data[point].x;
      const dataY = dataset.data[point].y;

      if (nbSelectedPoints < 2) {
        if (dataset.pointBackgroundColor[point] === '#16A085') {
          dataset.pointBackgroundColor[point] = '#FF5722';
          nbSelectedPoints++;
          addSessionAngle(dataX, dataY);
        } else {
          dataset.pointBackgroundColor[point] = '#16A085';
          nbSelectedPoints--;
          sessionStorage.removeItem('selected-angles');
        }
      } else {
        if (dataset.pointBackgroundColor[point] === '#FF5722') {
          dataset.pointBackgroundColor[point] = '#16A085';
          nbSelectedPoints--;
          removeSessionAngle(dataX, dataY);
        } else {
          const firstSelectedIndex = dataset.pointBackgroundColor.indexOf('#FF5722');
          const secondSelectedIndex = dataset.pointBackgroundColor.lastIndexOf('#FF5722');
          const distToFirst = Math.abs(firstSelectedIndex - point);
          const distToSecond = Math.abs(secondSelectedIndex - point);

          if (distToFirst < distToSecond) {
            dataset.pointBackgroundColor[firstSelectedIndex] = '#16A085';
          } else {
            dataset.pointBackgroundColor[secondSelectedIndex] = '#16A085';
          }

          dataset.pointBackgroundColor[point] = '#FF5722';
          removeSessionAngle(dataX, dataY, true);
          addSessionAngle(dataX, dataY);
        }
      }

      plot.update();
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
        data: [
          { x: 0, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 0.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 1, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 1.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 2, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 2.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 3, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 3.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 4, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 4.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 5.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 6, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 6.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 7, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 7.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
          { x: 8, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 8.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 9, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 9.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
          { x: 10, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) }
        ]
      }
    ]
  }
};

let currentParticipant = 0;
let currentIteration = 0;

if (!(analysis === null)) {
  infoAnalysis.innerText = analysis;
}

function removeSessionAngle(x, y, nearest = false) {
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
}

function addSessionAngle(x, y) {
  let sessionAngles = sessionStorage.getItem('selected-angles');
  if (sessionAngles === null) {
    sessionStorage.setItem('selected-angles', `${x},${y}`);
  } else {
    sessionAngles += `;${x},${y}`;
    sessionStorage.setItem('selected-angles', sessionAngles);
  }

  checkSelectedAngles();
}

function checkSelectedAngles() {
  const sessionAngles = sessionStorage.getItem('selected-angles');
  if (!(sessionAngles === null)) {
    if (sessionAngles.split(';').length === 2) {
      submitBtn.removeAttribute('disabled');
    } else {
      submitBtn.setAttribute('disabled', '');
    }
  } else {
    submitBtn.setAttribute('disabled', '');
  }
}

function updateInfos() {
  infoParticipant.innerText = participants[currentParticipant];
  infoIter.innerText = `Iter. ${currentIteration + 1}`;

  if (currentIteration > 0) {
    dots[currentIteration - 1].classList.toggle('active');
  } else {
    dots[dots.length - 1].classList.remove('active');
  }

  dots[currentIteration].classList.toggle('active');

  if (currentIteration === 2 && currentParticipant + 1 === participants.length) {
    submitBtn.innerText = `Terminer`;
    submitBtn.classList.add('completed');
  }
}

updateInfos();
checkSelectedAngles();

// eslint-disable-next-line no-undef
const plot = new Chart(chartCtx, conf);

plot.data.datasets[0].pointBackgroundColor = plot.data.datasets[0].data.map(() => {
  return '#16A085';
});

let allData = plot.data.datasets[0].data;

submitBtn.addEventListener('click', () => {
  if (submitBtn.classList.contains('completed')) {
    LoaderOverlay.toggle();
    sessionStorage.setItem('results-available', true);
    sessionStorage.removeItem('selected-angles');

    setTimeout(() => {
      Router.switchPage('participants-selection.html');
    }, 2000);
  } else {
    sessionStorage.removeItem('selected-angles');
    checkSelectedAngles();

    plot.data.datasets[0].pointBackgroundColor = plot.data.datasets[0].data.map(() => {
      return '#16A085';
    });

    nbSelectedPoints = 0;
    firstElementZoom = null;

    allData = [
      { x: 0, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 0.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 1, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 1.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 2, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 2.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 3, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 3.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 4, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 4.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 5.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 6, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 6.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 7, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 7.5, y: Math.floor(Math.random() * (45 - 30 + 1) + 30) },
      { x: 8, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 8.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 9, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 9.5, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) },
      { x: 10, y: Math.floor(Math.random() * (100 - 90 + 1) + 90) }
    ];

    plot.data.datasets[0].data = allData;
    plot.update();

    if (currentIteration < 2) {
      currentIteration++;
    } else {
      currentIteration = 0;
      currentParticipant++;
    }

    updateInfos();
  }
});
