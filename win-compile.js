const path = require('path');
const env = require('./env.build.json');

/**
 * signToolPath may also be located to:
 * C:\Program Files (x86)\Windows Kits\10\bin\<version>\x64\signtool.exe
 */

const SIGNTOOL_CONFIG = {
  signToolName: 'signtool',
  signToolPath:
    'C:\\Program Files (x86)\\Microsoft SDKs\\ClickOnce\\SignTool\\signtool.exe',
  signAlgo: 'SHA256',
  timestampServerURL: 'http://timestamp.comodoca.com/authenticode'
};

const SIGNTOOL_COMMAND = `${SIGNTOOL_CONFIG.signToolPath} sign /f "${path.resolve(
  env.CERT_PATH
)}" /p ${env.CERT_PWD} /fd ${SIGNTOOL_CONFIG.signAlgo} /t ${
  SIGNTOOL_CONFIG.timestampServerURL
} /v $f`;

require('innosetup-compiler')(
  './winx64-installer.iss',
  {
    gui: false,
    verbose: true,
    signtoolname: SIGNTOOL_CONFIG.signToolName,
    signtoolcommand: SIGNTOOL_COMMAND
  },
  error => {
    console.log(error);
  }
);
