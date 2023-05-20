const path = require('path');
const env = require('./env.json');

require('innosetup-compiler')(
  './winx64-installer.iss',
  {
    gui: false,
    verbose: true,
    signtoolname: 'signtool',
    signtoolcommand: `"C:\\Program Files (x86)\\Microsoft SDKs\\ClickOnce\\SignTool\\signtool.exe" sign /f "${path.resolve(
      env.CERT_PATH
    )}" /p ${env.CERT_PWD} /fd SHA256 /t http://timestamp.comodoca.com/authenticode /v $f`
  },
  error => {
    console.log(error);
  }
);
