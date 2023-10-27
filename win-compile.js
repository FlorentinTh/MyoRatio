const path = require('path');
const env = require('./env.build.json');

/**
 * Base folder containing signtool.exe must be set to Path environment variable.
 * This path may be either:
 *  - C:\Program Files (x86)\Microsoft SDKs\ClickOnce\SignTool
 * or
 *  - C:\Program Files (x86)\Windows Kits\10\bin\<version>\x64\
 */
const SIGNTOOL_CONFIG = {
  signToolName: 'signtool',
  signAlgo: 'SHA256',
  timestampServerURL: 'http://timestamp.comodoca.com/authenticode'
};

const CERT_PATH = path.resolve(env.CERT_PATH);

const SIGNTOOL_COMMAND = `${SIGNTOOL_CONFIG.signToolName} sign /f "${CERT_PATH}" /p ${env.CERT_PWD} /fd ${SIGNTOOL_CONFIG.signAlgo} /t ${SIGNTOOL_CONFIG.timestampServerURL} /v $f`;

require('innosetup-compiler')(
  './winx64-installer.iss',
  {
    gui: false,
    verbose: true,
    signtoolname: SIGNTOOL_CONFIG.signToolName,
    signtoolcommand: SIGNTOOL_COMMAND
  },
  error => {
    if (error) {
      console.error(error);
      process.exit(-1);
    } else {
      console.log('\n--> InnoSetup compilation successful!');
      process.exit(0);
    }
  }
);
