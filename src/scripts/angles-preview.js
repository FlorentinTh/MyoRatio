import '../styles/angles-preview.css';
import previewCard from '../views/partials/angles-preview/preview-card.hbs';

import Chart from 'chart.js/auto';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { getAllParticipants } from './components/participants';
import { Metadata } from './components/metadata';
import { LoaderOverlay } from './components/loader-overlay.js';
import { ErrorOverlay } from './components/error-overlay';
import { ChartSetup } from './utils/chart-setup';
import { PathHelper } from './helpers/path-helper';
import { StringHelper } from './helpers/string-helper';
import { ChartHelper } from './helpers/chart-helper.js';
import { DataHelper } from './helpers/data-helper.js';

const path = nw.require('path');

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();
menu.init();

const dataFolderPathSession = sessionStorage.getItem('data-path');
const analysisType = sessionStorage.getItem('analysis');

const analysisTitle = document.querySelector('.analysis h3');
const gridContainer = document.querySelector('.participant-card-container');
const submitButton = document.querySelector('button[type="submit"]');
const resetButton = document.querySelector('button[type="reset"]');

const allComplexitiesSelected = [];

analysisTitle.innerText += ` ${analysisType}`;

const initChartOptions = () => {
  delete ChartSetup.options.plugins.crosshair;

  ChartSetup.options.scales.x.title.padding.top = 10;
  ChartSetup.options.scales.y.title.padding.top = 10;
  ChartSetup.data.datasets[0].pointHoverRadius = 5;
  ChartSetup.data.datasets[0].pointRadius = 3;
  ChartSetup.data.datasets[0].borderWidth = 2;
};

initChartOptions();

const displayPreviewCard = (participant, infos) => {
  gridContainer.insertAdjacentHTML('afterbegin', previewCard({ participant, infos }));
};

const participantsFolderPath = path.join(dataFolderPathSession, analysisType);
const sanitizedParticipantsFolderPath = PathHelper.sanitizePath(participantsFolderPath);
const participants = await getAllParticipants(sanitizedParticipantsFolderPath);
const metadata = new Metadata(dataFolderPathSession);

if (participants?.length > 0) {
  for (const participant of participants) {
    const participantName = StringHelper.formatParticipantName(participant);
    const infos = await metadata.getParticipantInfo(
      PathHelper.sanitizePath(analysisType),
      participantName
    );

    displayPreviewCard(participantName, infos);
  }
} else {
  const errorOverlay = new ErrorOverlay({
    message: `Error occurs while trying to retrieve participants`,
    details: `Received participants: ${participants}`,
    interact: true
  });

  errorOverlay.show();
}

const initComplexityRadio = (complexityRadio, card, onChange = false) => {
  if (complexityRadio.checked) {
    if (onChange) {
      if (complexityRadio.value.toLowerCase() === 'low') {
        if (!card.querySelector('.auto-switch').checked) {
          card.querySelector('.auto-switch').checked = true;
        }
      } else {
        if (card.querySelector('.auto-switch').checked) {
          card.querySelector('.auto-switch').checked = false;
        }
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

const getComplexityRadios = card => {
  const complexityRadios = [...card.querySelector('.switch').children];
  return complexityRadios.filter(item => item.nodeName === 'INPUT');
};

for (let i = 0; i < gridContainer.children.length; i++) {
  const card = gridContainer.children[i];
  const chartContext = card.querySelector('canvas').getContext('2d');
  const chart = new Chart(chartContext, ChartSetup);

  chart.data.datasets[0].backgroundColor =
    ChartHelper.generateChartGradient(chartContext);

  chart.data.datasets[0].data = DataHelper.generateSyntheticData();
  chart.update();

  const complexityRadios = getComplexityRadios(card);

  for (const complexityRadio of complexityRadios) {
    initComplexityRadio(complexityRadio, card);

    complexityRadio.addEventListener('change', event => {
      initComplexityRadio(complexityRadio, card, true);
      checkAllComplexitiesSelected();
    });
  }
}

checkAllComplexitiesSelected();

const saveData = async () => {
  const cards = gridContainer.children;
  for (const card of cards) {
    const participant = card.querySelector('h3').innerText.toLowerCase();
    const autoAngles = card.querySelector('.auto-switch').checked;
    const complexityRadios = getComplexityRadios(card);

    let complexity;

    for (const complexityRadio of complexityRadios) {
      if (complexityRadio.checked) {
        complexity = complexityRadio.value.toLowerCase();
      }
    }

    await metadata.writeContent(analysisType, participant, {
      complexity,
      auto_angles: autoAngles
    });
  }
};

submitButton.addEventListener('click', async () => {
  if (!submitButton.disabled) {
    loaderOverlay.toggle({ message: 'Saving data...' });

    await saveData();

    setTimeout(() => {
      router.switchPage('participants-selection');
    }, 1000);
  }
});

resetButton.addEventListener('click', () => {
  router.switchPage('participants-selection');
});
