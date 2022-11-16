import Menu from './components/menu.js';

const menuBtns = [];
menuBtns.push(document.querySelector('.export-pdf-btn'));
menuBtns.push(document.querySelector('.export-xls-btn'));

const menu = new Menu();
menu.init(menuBtns);
