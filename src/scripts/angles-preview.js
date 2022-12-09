import '../styles/angles-preview.css';

import Chart from 'chart.js/auto';

import { Menu } from './components/menu.js';
import { Router } from './utils/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';

const menu = new Menu();
menu.init();

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

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
            bottom: 10
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
const submitBtn = document.querySelector('button[type="submit"]');

const resetBtn = document.querySelector('button[type="reset"]');

resetBtn.addEventListener('click', () => {
  router.switchPage('participants-selection.html');
});

const allComplexitiesSelected = [];

function checkAllComplexitiesSelected() {
  if (allComplexitiesSelected.length < gridContainer.children.length) {
    if (!submitBtn.disabled) {
      submitBtn.setAttribute('disabled', '');
    }
  } else {
    if (submitBtn.disabled) {
      submitBtn.removeAttribute('disabled');
    }
  }
}

for (let i = 0; i < gridContainer.children.length; i++) {
  const card = gridContainer.children[i];
  const ctx = card.querySelector('canvas').getContext('2d');
  const gradient = ctx.createLinearGradient(0, 25, 0, 220);
  gradient.addColorStop(0, 'rgba(22, 160, 133, 0.3)');
  gradient.addColorStop(0.5, 'rgba(22, 160, 133, 0.15)');
  gradient.addColorStop(1, 'rgba(22, 160, 133, 0)');

  // eslint-disable-next-line no-undef, no-new
  const plot = new Chart(ctx, conf);
  plot.data.datasets[0].backgroundColor = gradient;
  plot.data.datasets[0].data = [
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
  plot.update();

  let radios = [...card.querySelector('.switch').children];
  radios = radios.filter(item => item.nodeName === 'INPUT');

  for (const radio of radios) {
    if (radio.checked) {
      if (radio.value.toLowerCase() === 'low') {
        if (!card.querySelector('.auto-switch').checked) {
          card.querySelector('.auto-switch').checked = true;
        }
      } else {
        if (card.querySelector('.auto-switch').checked) {
          card.querySelector('.auto-switch').checked = false;
        }
      }

      if (!allComplexitiesSelected.includes(radio.name)) {
        allComplexitiesSelected.push(radio.name);
      }
    }

    radio.addEventListener('change', event => {
      if (radio.checked) {
        if (radio.value.toLowerCase() === 'low') {
          if (!card.querySelector('.auto-switch').checked) {
            card.querySelector('.auto-switch').checked = true;
          }
        } else {
          if (card.querySelector('.auto-switch').checked) {
            card.querySelector('.auto-switch').checked = false;
          }
        }

        if (!allComplexitiesSelected.includes(radio.name)) {
          allComplexitiesSelected.push(radio.name);
        }
        checkAllComplexitiesSelected();
      }
    });
  }
}

checkAllComplexitiesSelected();

submitBtn.addEventListener('click', () => {
  if (!submitBtn.disabled) {
    loaderOverlay.toggle({ message: 'Saving data...' });

    setTimeout(() => {
      router.switchPage('participants-selection.html');
    }, 1000);
  }
});
