import '../styles/settings.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { Loader } from './components/loader.js';
import { SessionStore } from './utils/session-store';
import { PathHelper } from './helpers/path-helper.js';
import { MutexHelper } from './helpers/mutex-helper.js';
import { ErrorOverlay } from './components/overlay.js';
import { StringHelper } from './helpers/string-helper.js';

const router = new Router();
router.disableBackButton();

SessionStore.clear({
  keep: ['data-path', 'analysis', 'require-setup', 'locked-participant']
});

if ('locked-participant' in sessionStorage) {
  const participant = PathHelper.sanitizePath(
    sessionStorage.getItem('locked-participant').toString().toLowerCase().trim()
  );

  const participantLabel = StringHelper.revertParticipantNameFromSession(participant);

  try {
    await MutexHelper.unlock(participant);
  } catch (error) {
    const errorOverlay = new ErrorOverlay({
      message: `Internal error`,
      details: `cannot unlock participant: ${participantLabel}`,
      interact: true,
      interactBtnLabel: 'retry',
      redirect: 'settings'
    });

    errorOverlay.show();
  }
}

const loader = new Loader();

const menu = new Menu();
menu.init();
menu.setItemActive('settings');

const notificationStatus = document.querySelector('#notification-status > .accent');
const notificationButton = document.getElementById('notification-btn');
const windowSizeInput = document.getElementById('window-size');
const submitButton = document.querySelector('button[type="submit"]');

if (!('filtered-data-alert' in localStorage)) {
  localStorage.setItem('filtered-data-alert', true);
}

const updateNotificationPreferences = () => {
  let statusText;
  let buttonText;

  if (JSON.parse(localStorage.getItem('filtered-data-alert'))) {
    statusText = 'enabled';
    buttonText = 'disable';
  } else {
    statusText = 'disabled';
    buttonText = 'enable';
  }

  notificationStatus.textContent = ` ${statusText}.`;
  notificationButton.textContent = buttonText;
};

updateNotificationPreferences();

notificationButton.addEventListener('click', () => {
  localStorage.setItem(
    'filtered-data-alert',
    !JSON.parse(localStorage.getItem('filtered-data-alert'))
  );

  updateNotificationPreferences();
});

if (!('window-size' in localStorage)) {
  localStorage.setItem('window-size', Number(windowSizeInput.value));
} else {
  windowSizeInput.value = Number(localStorage.getItem('window-size'));
}

windowSizeInput.addEventListener('keyup', event => {
  const value = event.target.value;

  if (!(value === '') && value > 0) {
    localStorage.setItem('window-size', Number(value));

    if (submitButton.disabled) {
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
    loader.toggle({ message: 'Saving data...' });

    setTimeout(() => {
      router.switchPage('data-discovering');
    }, 500);
  }
});
