import '../styles/main.css';

import { LoaderOverlay } from './components/loader-overlay.js';
import { Router } from './routes/router.js';

const path = nw.require('path');
const { execFile } = nw.require('child_process');

const loaderOverlay = new LoaderOverlay();
loaderOverlay.toggle({ message: 'Loading Application Components...' });

const router = new Router();
router.disableBackButton();

const basePath = process.env.INIT_CWD ?? process.cwd();
const APIExecutablePath = path.join(basePath, 'bin', 'EMGTrignoAPI', 'EMGTrignoAPI.exe');

localStorage.setItem('window-size', 0.2);

execFile(APIExecutablePath, error => {
  if (error) {
    sessionStorage.setItem(
      'app-error',
      JSON.stringify({
        message: 'Some required components cannot be launched',
        details: error.message
      })
    );
  }
});

setTimeout(() => {
  router.switchPage('data-discovering');
}, 3000);
