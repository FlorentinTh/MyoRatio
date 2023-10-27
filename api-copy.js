const fs = require('node:fs');
const fse = require('fs-extra');
const path = require('path');

const envBuildFile = fs.readFileSync(path.normalize('./env.build.json'));
const envBuildData = JSON.parse(envBuildFile);
const APIPath = path.normalize(envBuildData.API_PATH);

const APISourceFolder = path.join(APIPath, 'dist', 'MyoRatioAPI');
const targetFolder = 'bin/MyoRatioAPI';

if (fs.existsSync(targetFolder)) {
  fs.rmSync(targetFolder, { recursive: true, force: true });
}

fse
  .copy(APISourceFolder, targetFolder)
  .then(() => {
    console.log('--> API successfully copied to bin folder');
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(-1);
  });
