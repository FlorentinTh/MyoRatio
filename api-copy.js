const { readFileSync, existsSync, rmSync } = require('node:fs');
const fse = require('fs-extra');
const path = require('node:path');

let envBuildFile;
try {
  envBuildFile = readFileSync(path.normalize('./env.build.json'), { encoding: 'utf8' });
} catch (error) {
  console.error(error);
  process.exit(-1);
}

const envBuildData = JSON.parse(envBuildFile);
const APIPath = path.normalize(envBuildData.API_PATH);

const APISourceFolder = path.join(APIPath, 'dist', 'MyoRatioAPI');
const targetFolder = 'bin/MyoRatioAPI';

if (existsSync(targetFolder)) {
  try {
    rmSync(targetFolder, { recursive: true, force: true });
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
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
