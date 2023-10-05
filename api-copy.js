const fs = require('fs-extra');
const path = require('path');

const recursiveCopy = (source, target) => {
  if (fs.lstatSync(source).isDirectory()) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target);
    }

    const files = fs.readdirSync(source);

    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      recursiveCopy(sourcePath, targetPath);
    });
  } else {
    fs.copyFileSync(source, target);
  }
};

const envBuildFile = fs.readFileSync(path.normalize('./env.build.json'));
const envBuildData = JSON.parse(envBuildFile);
const APIPath = path.normalize(envBuildData.API_PATH);

const APISourceFolder = path.join(APIPath, 'dist', 'MyoRatioAPI');
const targetFolder = 'bin/MyoRatioAPI';

if (fs.existsSync(targetFolder)) {
  fs.remove(targetFolder, error => {
    if (error) {
      throw new Error(error);
    }

    recursiveCopy(APISourceFolder, targetFolder);
  });
} else {
  recursiveCopy(APISourceFolder, targetFolder);
}

console.log('--> API successfully copied to bin folder');
