import '../styles/settings.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();
menu.init();
menu.setItemActive('settings');

const windowSizeInput = document.getElementById('window-size');
const submitButton = document.querySelector('button[type="submit"]');

if (!('window-size' in localStorage)) {
  localStorage.setItem('window-size', windowSizeInput.value);
} else {
  windowSizeInput.value = localStorage.getItem('window-size');
}

windowSizeInput.addEventListener('input', event => {
  const value = event.target.value;

  if (!(value === '') && value > 0) {
    if (submitButton.disabled) {
      localStorage.setItem('window-size', value);
      submitButton.removeAttribute('disabled');
    }
  } else {
    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  }
});

submitButton.addEventListener('click', () => {
  if (!submitButton.disabled) {
    loaderOverlay.toggle({ message: 'Saving data...' });

    setTimeout(() => {
      router.switchPage('data-discovering');
    }, 500);
  }
});
