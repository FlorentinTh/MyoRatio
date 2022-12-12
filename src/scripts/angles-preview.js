import '../styles/angles-preview.css';

import Chart from 'chart.js/auto';

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
menu.init();

const gridContainer = document.querySelector('.participant-card-container');
const submitButton = document.querySelector('button[type="submit"]');
const resetButton = document.querySelector('button[type="reset"]');

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

delete ChartSetup.options.plugins.crosshair;

ChartSetup.options.scales.x.title.padding.top = 10;
ChartSetup.options.scales.y.title.padding.top = 10;
ChartSetup.data.datasets[0].pointHoverRadius = 5;
ChartSetup.data.datasets[0].pointRadius = 3;
ChartSetup.data.datasets[0].borderWidth = 2;

for (let i = 0; i < gridContainer.children.length; i++) {
  const card = gridContainer.children[i];
  const chartContext = card.querySelector('canvas').getContext('2d');
  const chart = new Chart(chartContext, ChartSetup);

  chart.data.datasets[0].backgroundColor =
    ChartHelper.generateChartGradient(chartContext);

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

resetButton.addEventListener('click', () => {
  router.switchPage('participants-selection');
});
