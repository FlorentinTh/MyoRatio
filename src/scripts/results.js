import '../styles/results.css';
import resultsTable from '../views/partials/results/results-table.hbs';

import { createPopper } from '@popperjs/core';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Metadata } from './utils/metadata.js';
import { PathHelper } from './helpers/path-helper';
import { ErrorOverlay } from './components/overlay';
import { FileHelper } from './helpers/file-helper';

const path = nw.require('path');

const router = new Router();
router.disableBackButton();

const menu = new Menu();

const highlightButton = document.querySelector('.highlight-btn');
menu.init(highlightButton);

const dataPath = sessionStorage.getItem('data-path').toString();
const analysisType = sessionStorage.getItem('analysis').toString();
const participantResult = sessionStorage.getItem('participant-result').toString();
const stage = sessionStorage.getItem('stage').toString();

const title = document.querySelector('.title span');

const inputDataPath = PathHelper.sanitizePath(dataPath);
const metadata = new Metadata(inputDataPath);

const tableContainer = document.querySelector('.matrix-container');

const getRatiosFilePath = async () => {
  let inputPath;

  try {
    inputPath = await metadata.getParticipantFolderPath(analysisType, participantResult, {
      fromSession: true
    });
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Cannot find results for participant ${participantResult}`,
      details: error.message,
      interact: true
    });

    errorOverlay.show();
  }

  return path.join(inputPath, `ratios_${stage}_mean.json`);
};

if (!(analysisType === 'extension')) {
  highlightButton.classList.add('disabled');
}

const ratiosFilePath = await getRatiosFilePath();

let ratiosFileJSON;

try {
  ratiosFileJSON = await FileHelper.parseJSONFile(
    PathHelper.sanitizePath(ratiosFilePath)
  );
} catch (error) {
  const errorOverlay = new ErrorOverlay({
    message: `Cannot read results of participant ${participantResult}`,
    details: error.message,
    interact: true
  });

  errorOverlay.show();
}

if (!(analysisType === null) && !(participantResult === null) && !(stage === null)) {
  const nbIterations = ratiosFileJSON.nb_iteration;
  title.innerText += ` ${nbIterations} ${analysisType}s for the ${participantResult} during the ${stage} stage`;
}

const displayResultsTable = () => {
  const muscles = ratiosFileJSON.data.map(item => item.muscle);
  const ratios = ratiosFileJSON.data;

  tableContainer.insertAdjacentHTML(
    'afterbegin',
    resultsTable({
      muscles,
      ratios
    })
  );
};

displayResultsTable();

const table = document.querySelector('table');
const rowTooltips = document.querySelectorAll('.tooltip-row');
const colTooltips = document.querySelectorAll('.tooltip-col');
const rowIdentifiers = document.querySelectorAll('table tbody th[scope="row"]');
const colIdentifiers = document.querySelectorAll(
  'table thead th[scope="col"]:not(:last-of-type)'
);
const finishButton = document.querySelector('button[type="submit"]');

const initTooltips = (identifiers, tooltips, placement) => {
  for (let i = 0; i < identifiers.length; i++) {
    const popperInstance = createPopper(identifiers[i], tooltips[i], {
      placement
    });

    identifiers[i].addEventListener('mouseenter', () => {
      tooltips[i].setAttribute('data-show', '');
      popperInstance.update();
    });

    identifiers[i].addEventListener('mouseleave', () => {
      tooltips[i].removeAttribute('data-show');
    });
  }
};

initTooltips(rowIdentifiers, rowTooltips, 'right');
initTooltips(colIdentifiers, colTooltips, 'top');

const correspondingColumnCell = index => {
  return table.querySelector(`thead th:nth-child(${index + 1})`);
};

const highlightColumn = index => {
  correspondingColumnCell(index).classList.add('column-hover');
};

const highlightedColumn = () => {
  return table.querySelector('.column-hover');
};

const removeHighlightedColumns = () => {
  if (highlightedColumn()) {
    highlightedColumn().classList.remove('column-hover');
  }
};

const getRelevantRatioCoords = analysis => {
  let antagonist;
  let agonist;

  if (analysis === 'extension') {
    antagonist = 'R RECTUS FEMORIS';
    agonist = 'R BICEPS FEMORIS';
  }

  const rows = document.querySelectorAll('div.tooltip-row');

  let rowID;

  for (let i = 0; i < rows.length; i++) {
    const muscleName = rows[i].innerText.trim();

    if (!(muscleName === undefined)) {
      if (muscleName.toLowerCase().includes(agonist.toLowerCase())) {
        rowID = i;
      }
    }
  }

  const columns = document.querySelector('table thead tr').children;

  let columnID;

  for (let i = 0; i < columns.length - 1; i++) {
    const muscleName = columns[i].querySelector('div.tooltip-col').innerText.trim();

    if (!(muscleName === undefined)) {
      if (muscleName.toLowerCase().includes(antagonist.toLowerCase())) {
        columnID = i;
      }
    }
  }

  return { rowID, columnID };
};

table.addEventListener('mouseover', event => {
  const item = event.target;

  if (item.nodeName === 'TD' && !(item.innerHTML === '')) {
    const index = [].indexOf.call(item.parentNode.children, item);
    highlightColumn(index);
  }
});

table.addEventListener('mouseout', () => {
  removeHighlightedColumns();
});

highlightButton.addEventListener('click', () => {
  if (!highlightButton.disabled) {
    const { rowID, columnID } = getRelevantRatioCoords(analysisType);

    const rows = document.querySelectorAll('#matrix table tbody tr');
    const cell = rows[rowID].children[columnID];
    cell.classList.add('highlight');
    highlightButton.classList.add('disabled');
  }
});

finishButton.addEventListener('click', () => {
  if ('participant-result' in sessionStorage) {
    sessionStorage.removeItem('participant-result');
  }

  router.switchPage('participants-selection');
});
