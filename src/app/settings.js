import Menu from './components/menu.js';
import Router from './utils/router.js';

Router.disableBackButton();

const menu = new Menu();
menu.init();

const submitBtn = document.querySelector('button[type="submit"]');

submitBtn.addEventListener('click', () => {
  if (!submitBtn.disabled) {
    Router.switchPage('data-discovering.html');
  }
});
