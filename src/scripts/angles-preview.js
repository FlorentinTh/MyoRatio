import '../styles/angles-preview.css';

import Chart from 'chart.js/auto';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';
import { DataHelper } from './helpers/data-helper.js';

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();
menu.init();

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
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Seconds',
          padding: {
            top: 10
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
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Degrees',
          padding: {
            bottom: 10
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
        }
      }
    },
    onHover: (event, chart) => {
      event.native.target.style.cursor = chart[0] ? 'pointer' : 'default';
    }
  },
  data: {
    datasets: [
      {
        pointBorderWidth: 1,
        pointHoverRadius: 8,
        pointBackgroundColor: '#16A085',
        pointHoverBorderColor: '#232323dd',
        pointHoverBorderWidth: 2,
        pointRadius: 4,
        borderWidth: 3,
        pointStyle: 'circle',
        borderColor: '#16A085',
        showLine: true,
        fill: true,
        interpolate: true,
        lineTension: 0
      }
    ]
  }
};

const gridContainer = document.querySelector('.participant-card-container');
const submitButton = document.querySelector('button[type="submit"]');
const resetButton = document.querySelector('button[type="reset"]');

resetButton.addEventListener('click', () => {
  router.switchPage('participants-selection');
});

const allComplexitiesSelected = [];

const initComplexityRadio = (complexityRadio, card) => {
  if (complexityRadio.checked) {
    if (complexityRadio.value.toLowerCase() === 'low') {
      if (!card.querySelector('.auto-switch').checked) {
        card.querySelector('.auto-switch').checked = true;
      }
    } else {
      if (card.querySelector('.auto-switch').checked) {
        card.querySelector('.auto-switch').checked = false;
      }
    }

    if (!allComplexitiesSelected.includes(complexityRadio.name)) {
      allComplexitiesSelected.push(complexityRadio.name);
    }
  }
};

const checkAllComplexitiesSelected = () => {
  if (allComplexitiesSelected.length < gridContainer.children.length) {
    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  } else {
    if (submitButton.disabled) {
      submitButton.removeAttribute('disabled');
    }
  }
};

for (let i = 0; i < gridContainer.children.length; i++) {
  const card = gridContainer.children[i];
  const chartContext = card.querySelector('canvas').getContext('2d');

  const gradient = chartContext.createLinearGradient(0, 25, 0, 220);
  gradient.addColorStop(0, 'rgba(22, 160, 133, 0.3)');
  gradient.addColorStop(0.5, 'rgba(22, 160, 133, 0.15)');
  gradient.addColorStop(1, 'rgba(22, 160, 133, 0)');

  const chart = new Chart(chartContext, chartSetup);
  chart.data.datasets[0].backgroundColor = gradient;

  chart.data.datasets[0].data = DataHelper.generateSyntheticData();

  chart.update();

  let complexityRadios = [...card.querySelector('.switch').children];
  complexityRadios = complexityRadios.filter(item => item.nodeName === 'INPUT');

  for (const complexityRadio of complexityRadios) {
    initComplexityRadio(complexityRadio, card);

    complexityRadio.addEventListener('change', event => {
      initComplexityRadio(complexityRadio, card);
      checkAllComplexitiesSelected();
    });
  }
}

checkAllComplexitiesSelected();

submitButton.addEventListener('click', () => {
  if (!submitButton.disabled) {
    loaderOverlay.toggle({ message: 'Saving data...' });

    setTimeout(() => {
      router.switchPage('participants-selection');
    }, 1000);
  }
});
