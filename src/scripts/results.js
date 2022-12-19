import '../styles/results.css';

import { createPopper } from '@popperjs/core';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';

const router = new Router();
router.disableBackButton();

const menu = new Menu();
menu.init();

const title = document.querySelector('.title span');

if (
  !(sessionStorage.getItem('participant-result') === null) &&
  !(sessionStorage.getItem('analysis') === null)
) {
  title.innerText += ` ${sessionStorage.getItem(
    'analysis'
  )}s for the ${sessionStorage.getItem('participant-result')}`;
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

finishButton.addEventListener('click', () => {
  if ('participant-result' in sessionStorage) {
    sessionStorage.removeItem('participant-result');
  }

  router.switchPage('participants-selection');
});
