import '../styles/copyright.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { SessionStore } from './utils/session-store';
import { StringHelper } from './helpers/string-helper.js';
import { PathHelper } from './helpers/path-helper.js';
import { MutexHelper } from './helpers/mutex-helper.js';
import { ErrorOverlay } from './components/overlay.js';

const router = new Router();
router.disableBackButton();

const menu = new Menu();
menu.init();
menu.setItemActive('copyright');

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
      redirect: 'copyright'
    });

    errorOverlay.show();
  }
}
