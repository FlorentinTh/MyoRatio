import '../styles/copyright.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';

const router = new Router();
router.disableBackButton();

const menu = new Menu();
menu.init();
menu.setItemActive('copyright');
