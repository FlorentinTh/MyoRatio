import Menu from './components/menu.js';
import Router from './utils/router.js';

// eslint-disable-next-line no-undef
const Popper = nw.require('@popperjs/core');

const menuBtns = [];
menuBtns.push(document.querySelector('.export-pdf-btn'));
menuBtns.push(document.querySelector('.export-xls-btn'));

const menu = new Menu();
menu.init(menuBtns);

const table = document.querySelector('table');

const rowTooltips = document.querySelectorAll('.tooltip-row');
const colTooltips = document.querySelectorAll('.tooltip-col');

const rowIdentifiers = document.querySelectorAll('table tbody th[scope="row"]');
const colIdentifiers = document.querySelectorAll(
  'table thead th[scope="col"]:not(:last-of-type)'
);

const finishBtn = document.querySelector('button[type="submit"]');

function initTooltips(identifiers, tooltips, placement) {
  for (let i = 0; i < identifiers.length; i++) {
    const popperInstance = Popper.createPopper(identifiers[i], tooltips[i], {
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
}

initTooltips(rowIdentifiers, rowTooltips, 'right');
initTooltips(colIdentifiers, colTooltips, 'top');

const highlightedColumn = () => {
  return table.querySelector('.column-hover');
};

function removeHighlightedColumns() {
  if (highlightedColumn()) {
    highlightedColumn().classList.remove('column-hover');
  }
}

function getRelatedColumnCell(index) {
  return table.querySelector(`thead th:nth-child(${index + 1})`);
}

function highlightColumn(index) {
  getRelatedColumnCell(index).classList.add('column-hover');
}

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

finishBtn.addEventListener('click', () => {
  Router.switchPage('participants-selection.html');
});
