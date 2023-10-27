const fs = require('fs');
const readline = require('readline');
const path = require('path');
const pkg = require('./package.json');

const APP_VERSION = JSON.stringify(pkg.version);
const FILENAME = 'winx64-installer.iss';

const inputPath = path.normalize(`./${FILENAME}`);
const outputPath = path.normalize(`./${FILENAME}.lock`);

const readStream = fs.createReadStream(inputPath);
const writeStream = fs.createWriteStream(outputPath);

const lineReader = readline.createInterface({
  input: readStream,
  output: writeStream,
  crlfDelay: Infinity
});

lineReader.on('line', line => {
  if (line.includes('#define MyAppVersion')) {
    const updatedLine = line.replace(/"(.*?)"/g, `${APP_VERSION}`);
    writeStream.write(updatedLine + '\n');
  } else {
    writeStream.write(line + '\n');
  }
});

lineReader.on('close', () => {
  lineReader.close();
  readStream.close();
  writeStream.close();
});

writeStream.on('close', () => {
  try {
    fs.unlinkSync(inputPath);

    try {
      fs.renameSync(outputPath, inputPath);
    } catch (error) {
      console.error(
        `Error occurred while trying to rename: ${outputPath}. Error: `,
        error
      );
    }
  } catch (error) {
    console.error(`Error occurred while trying to delete: ${inputPath}. Error: `, error);
  }
});
