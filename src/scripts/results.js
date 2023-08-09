import '../styles/results.css';
import resultsTable from '../views/partials/results/results-table.hbs';

import { createPopper } from '@popperjs/core';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Metadata } from './app/metadata.js';
import { Stage } from './models/stage.js';
import { PathHelper } from './helpers/path-helper';
import { ErrorOverlay } from './components/overlay';
import { FileHelper } from './helpers/file-helper';
import { DOMElement } from './utils/dom-element';
import { SessionStore } from './utils/session-store';
import { Configuration } from './app/configuration.js';

const path = nw.require('path');

const router = new Router();
router.disableBackButton();

SessionStore.clear({
  keep: ['data-path', 'analysis', 'stage', 'require-setup', 'participant-result']
});

const menu = new Menu();

const highlightButton = document.querySelector('.highlight-btn');
menu.init(highlightButton);

const configuration = new Configuration();
let appData;

try {
  appData = await configuration.load();
} catch (error) {
  const errorOverlay = new ErrorOverlay({
    message: `Data configuration error`,
    details: error.message,
    interact: true
  });

  errorOverlay.show();
}

const inputDataPath = PathHelper.sanitizePath(
  sessionStorage.getItem('data-path').toString().trim()
);

const analysisType = PathHelper.sanitizePath(
  sessionStorage.getItem('analysis').toString().toLowerCase().trim()
);

const participantResult = PathHelper.sanitizePath(
  sessionStorage.getItem('participant-result').toString().toLowerCase().trim()
);

const stage = sessionStorage.getItem('stage').toString().trim();
const title = document.querySelector('.title span');
const metadata = new Metadata(inputDataPath);
const tableContainer = document.querySelector('.matrix-container');

const analysisObject = appData.analysis.find(
  item => item.label.toLowerCase() === analysisType
);

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
      interact: true,
      redirect: 'participants-selection'
    });

    errorOverlay.show();
    return;
  }

  return path.join(inputPath, `ratios_${stage}.json`);
};

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
    interact: true,
    redirect: 'participants-selection'
  });

  errorOverlay.show();
}

if (!(analysisType === null) && !(participantResult === null) && !(stage === null)) {
  const nbIterations = ratiosFileJSON.nb_iteration;
  title.innerText += ` ${nbIterations} ${analysisType}s for the ${participantResult} during the ${stage} stage`;
}

const displayResultsTable = () => {
  const muscles = ratiosFileJSON.mean.map(item => item.muscle);
  const ratios = ratiosFileJSON.mean;

  DOMElement.clear(tableContainer);

  tableContainer.insertAdjacentHTML(
    'afterbegin',
    resultsTable({
      muscles,
      ratios
    })
  );
};

displayResultsTable();

const matrixElement = document.getElementById('matrix');
matrixElement.removeAttribute('class');

if (analysisObject.stages[stage].opening) {
  matrixElement.classList.add('lower');
} else {
  matrixElement.classList.add('upper');
}

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
  const antagonistID = analysisObject.muscles.antagonist;
  const agonistID = analysisObject.muscles.agonist;

  let antagonist = appData.muscles.find(item => item.id === antagonistID).label;
  let agonist = appData.muscles.find(item => item.id === agonistID).label;

  if (!(stage === Stage.CONCENTRIC)) {
    antagonist = appData.muscles.find(item => item.id === agonistID).label;
    agonist = appData.muscles.find(item => item.id === antagonistID).label;
  }

  const rows = document.querySelectorAll('div.tooltip-row');

  let rowID;

  for (let i = 0; i < rows.length; i++) {
    const muscleName = rows[i].innerText.trim();

    if (!(muscleName === undefined)) {
      if (muscleName.toLowerCase().includes(antagonist.toLowerCase())) {
        rowID = i;
      }
    }
  }

  const columns = document.querySelector('table thead tr').children;

  let columnID;

  for (let i = 0; i < columns.length - 1; i++) {
    const muscleName = columns[i].querySelector('div.tooltip-col').innerText.trim();

    if (!(muscleName === undefined)) {
      if (muscleName.toLowerCase().includes(agonist.toLowerCase())) {
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
