import Menu from './components/menu.js';
import Router from './utils/router.js';

Router.disableBackButton();

const menu = new Menu();
menu.init();
