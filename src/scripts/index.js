import '../styles/main.css';

import { Loader } from './components/loader.js';
import { Router } from './routes/router.js';
import { PlatformHelper } from './helpers/platform-helper.js';
import { Environment } from './app/environment.js';
import { retryFetch } from './helpers/fetch-helper.js';
import { ErrorOverlay } from './components/overlay.js';
import { NetHelper } from './helpers/net-helper.js';
import { FileHelper } from './helpers/file-helper.js';
import { Configuration } from './app/configuration.js';

const fs = nw.require('fs');
const path = nw.require('path');
const { spawn } = nw.require('child_process');

const environment = await Environment.load();

const loader = new Loader();
loader.toggle({ message: 'Loading application components...' });

const router = new Router();
router.disableBackButton();

const configuration = new Configuration();

if (!('filtered-data-alert' in localStorage)) {
  localStorage.setItem('filtered-data-alert', true);
}

if (!('window-size' in localStorage)) {
  localStorage.setItem('window-size', 0.2);
}

const testAPIConnection = async port => {
  return retryFetch(
    `http://${environment.HOST}:${port}/api/ping/`,
    {
      headers: {
        'X-API-Key': environment.API_KEY,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    },
    15,
    1000
  )
    .then(async response => {
      if (response.ok && response.status === 200) {
        return {
          ok: true,
          error: null
        };
      }
    })
    .catch(error => {
      return {
        ok: false,
        error
      };
    });
};

const initApplication = async () => {
  const isConnectedToAPI = await testAPIConnection(environment.PORT);

  if (!isConnectedToAPI.ok) {
    const details = isConnectedToAPI.error.message ?? 'API is not started';

    loader.toggle();

    const errorOverlay = new ErrorOverlay({
      message: 'Some required components cannot be started properly',
      details,
      interact: true,
      redirect: 'index',
      interactBtnLabel: 'Retry'
    });

    errorOverlay.show();
  } else {
    let configAccessError;

    try {
      await fs.promises.access(configuration.configurationFilePath);
    } catch (error) {
      configAccessError = error;

      if (error.code === 'ENOENT') {
        router.switchPage('import-data-configuration');
      }
    }

    if (configAccessError === undefined) {
      try {
        const appDataFileJSON = await FileHelper.parseJSONFile(
          configuration.configurationFilePath
        );

        if (appDataFileJSON.muscles.length <= 0) {
          sessionStorage.setItem('require-setup', true);

          setTimeout(() => {
            router.switchPage('data-configuration');
          }, 2000);
        } else {
          if (appDataFileJSON.analysis.length <= 0) {
            sessionStorage.setItem('require-setup', true);
            sessionStorage.setItem('setup', 'analysis');

            setTimeout(() => {
              router.switchPage('data-configuration');
            }, 2000);
          } else {
            sessionStorage.setItem('require-setup', false);

            setTimeout(() => {
              router.switchPage('data-discovering');
            }, 2000);
          }
        }
      } catch (error) {
        console.log(error);
        loader.toggle();

        const errorOverlay = new ErrorOverlay({
          message: 'The application cannot be initialized',
          details: 'application data cannot be read',
          interact: true,
          redirect: 'index',
          interactBtnLabel: 'retry'
        });

        errorOverlay.show();
      }
    } else {
      loader.toggle();

      const errorOverlay = new ErrorOverlay({
        message: 'The application cannot be initialized',
        details: configAccessError,
        interact: true,
        redirect: 'index',
        interactBtnLabel: 'retry'
      });

      errorOverlay.show();
    }
  }
};

if (process.env.NODE_ENV === 'development') {
  localStorage.setItem('port', environment.PORT);
  await initApplication();
} else {
  let basePath;
  let APIExecutablePath;

  if (PlatformHelper.isWindowsPlatform()) {
    basePath = nw.App.startPath;
    APIExecutablePath = path.join(basePath, 'bin', 'MyoRatioAPI', 'MyoRatioAPI.exe');
  } else if (PlatformHelper.isMacOsPlatform()) {
    basePath = process.env.INIT_CWD ?? process.cwd();
    APIExecutablePath = path.join(basePath, 'bin', 'MyoRatioAPI', 'MyoRatioAPI');
  }

  let port;

  try {
    port = await NetHelper.findNextAvailablePort(environment.PORT);
  } catch (error) {
    loader.toggle();

    const errorOverlay = new ErrorOverlay({
      message: 'Cannot find available port',
      details: error.message
    });

    errorOverlay.show();
  }

  if (!(port === undefined)) {
    localStorage.setItem('port', port);

    let childProcess;

    try {
      childProcess = spawn(APIExecutablePath, [port]);
    } catch (error) {
      loader.toggle();

      const errorOverlay = new ErrorOverlay({
        message: 'Some required components cannot be started properly',
        details: error.message,
        interact: true,
        redirect: 'index',
        interactBtnLabel: 'retry'
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

    await initApplication();
  }
}
