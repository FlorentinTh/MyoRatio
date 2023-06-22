import '../styles/license.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';

const router = new Router();
router.disableBackButton();

const menu = new Menu();
menu.init();
menu.setItemActive('license');

const versionTitle = document.querySelector('h2');
versionTitle.innerText += ` ${AppVersion}`;
