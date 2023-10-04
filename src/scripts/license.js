import '../styles/license.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { SessionStore } from './utils/session-store';
import { PathHelper } from './helpers/path-helper.js';
import { MutexHelper } from './helpers/mutex-helper.js';
import { ErrorOverlay } from './components/overlay.js';
import { StringHelper } from './helpers/string-helper.js';
import { Updater } from './app/updater.js';

import Swal from 'sweetalert2';

const router = new Router();
router.disableBackButton();

const menu = new Menu();
menu.init();
menu.setItemActive('license');

SessionStore.clear({
  keep: [
    'data-path',
    'analysis',
    'require-setup',
    'locked-participant',
    'update-available',
    'notify-update'
  ]
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
      redirect: 'license'
    });

    errorOverlay.show();
  }
}

const versionTitle = document.querySelector('h2');
versionTitle.innerText += ` ${AppVersion}`;

const updateButton = document.querySelector('.update button');

let isUpdateAvailable = false;
let notifyUpdate = false;

if ('update-available' in sessionStorage) {
  isUpdateAvailable =
    PathHelper.sanitizePath(
      sessionStorage.getItem('update-available').toString().toLowerCase().trim()
    ) === 'true';
}

if ('notify-update' in sessionStorage) {
  notifyUpdate =
    PathHelper.sanitizePath(
      sessionStorage.getItem('notify-update').toString().toLowerCase().trim()
    ) === 'true';
}

if (isUpdateAvailable && !notifyUpdate) {
  updateButton.innerText = 'update application';
  updateButton.classList.add('ready');
}

updateButton.addEventListener('click', async () => {
  const updater = new Updater(AppVersion);

  if (updateButton.classList.contains('ready')) {
    await updater.updateApp();
  } else {
    const isUpdateAvailable = await updater.checkUpdateAvailable();

    if (isUpdateAvailable) {
      updateButton.setAttribute('disabled', '');

      Swal.fire({
        title: 'New Version Available',
        text: 'An update of MyoRatio is available, do you want to update right now?',
        icon: 'info',
        background: '#ededed',
        customClass: {
          confirmButton: 'button-popup cancel',
          cancelButton: 'button-popup confirm'
        },
        buttonsStyling: false,
        padding: '0 0 35px 0',
        allowOutsideClick: false,
        showCancelButton: true,
        showDenyButton: false,
        confirmButtonText: `Download and Update`,
        cancelButtonText: `Later`
      })
        .then(async result => {
          if (!result.isConfirmed) {
            sessionStorage.setItem('notify-update', false);
            Swal.close();
          } else {
            const updater = new Updater(AppVersion);
            await updater.updateApp();
          }
        })
        .catch(error => {
          throw new Error(error);
        });
    } else {
      Swal.fire({
        title: 'Up to date!',
        text: 'Everything is up to date.',
        icon: 'success',
        background: '#ededed',
        customClass: {
          confirmButton: 'button-popup confirm'
        },
        buttonsStyling: false,
        padding: '0 0 35px 0',
        allowOutsideClick: false,
        showCancelButton: false,
        showDenyButton: false,
        confirmButtonText: `I Understand`
      })
        .then(async result => {
          if (result.isConfirmed) {
            Swal.close();
          }
        })
        .catch(error => {
          throw new Error(error);
        });
    }
  }
});
