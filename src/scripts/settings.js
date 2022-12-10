import '../styles/settings.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';

const menu = new Menu();
menu.init();

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const submitBtn = document.querySelector('button[type="submit"]');

submitBtn.addEventListener('click', () => {
  if (!submitBtn.disabled) {
    loaderOverlay.toggle({ message: 'Saving data...' });

    setTimeout(() => {
      router.switchPage('data-discovering');
    }, 1000);
  }
});
