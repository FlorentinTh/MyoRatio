import '../styles/main.css';

import { LoaderOverlay } from './components/loader-overlay.js';
import { Router } from './routes/router.js';
import { PlatformHelper } from './helpers/platform-helper.js';
import { Configuration } from './utils/configuration.js';
import { retryFetch } from './helpers/fetch-helper.js';
import { ErrorOverlay } from './components/overlay.js';
import { NetHelper } from './helpers/net-helper.js';

const path = nw.require('path');
const { spawn } = nw.require('child_process');

const configuration = await Configuration.load();

const loaderOverlay = new LoaderOverlay();
loaderOverlay.toggle({ message: 'Loading Application Components...' });

const router = new Router();
router.disableBackButton();

let basePath;
let APIExecutablePath;

if (PlatformHelper.isWindowsPlatform()) {
  basePath = nw.App.startPath;
  APIExecutablePath = path.join(basePath, 'bin', 'EMGTrignoAPI', 'EMGTrignoAPI.exe');
} else if (PlatformHelper.isMacOsPlatform()) {
  basePath = process.env.INIT_CWD ?? process.cwd();
  APIExecutablePath = path.join(basePath, 'bin', 'EMGTrignoAPI', 'EMGTrignoAPI');
}

if (!('filtered-data-alert' in localStorage)) {
  localStorage.setItem('filtered-data-alert', true);
}

if (!('window-size' in localStorage)) {
  localStorage.setItem('window-size', 0.2);
}

let port;

try {
  port = await NetHelper.findNextAvailablePort(configuration.PORT);
} catch (error) {
  console.lor(error);
}

if (!(port === undefined)) {
  localStorage.setItem('port', port);

  let childProcess;

  try {
    childProcess = spawn(APIExecutablePath, [port]);
  } catch (error) {
    loaderOverlay.toggle();
    const errorOverlay = new ErrorOverlay({
      message: 'Some required components cannot be launched',
      details: error.message
    });
    errorOverlay.show();
  }

  process.on('SIGINT', () => {
    childProcess.kill();
    process.exit();
  });

  process.on('SIGTERM', () => {
    childProcess.kill();
    process.exit();
  });

  retryFetch(
    `http://${configuration.HOST}:${port}/api/ping/`,
    {
      headers: {
        'X-API-Key': configuration.API_KEY,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    },
    10,
    500
  )
    .then(response => {
      setTimeout(() => {
        router.switchPage('data-discovering');
      }, 2000);
    })
    .catch(error => {
      const details = error.message ?? 'API is not started';
      loaderOverlay.toggle();
      const errorOverlay = new ErrorOverlay({
        message: 'Some required components cannot be launched',
        details
      });
      errorOverlay.show();
    });
}
