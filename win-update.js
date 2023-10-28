const {
  createReadStream,
  createWriteStream,
  unlinkSync,
  renameSync
} = require('node:fs');

const path = require('node:path');
const readline = require('readline');
const pkg = require('./package.json');

const APP_VERSION = JSON.stringify(pkg.version);
const FILENAME = 'winx64-installer.iss';

const inputPath = path.normalize(`./${FILENAME}`);
const outputPath = path.normalize(`./${FILENAME}.lock`);

const readStream = createReadStream(inputPath);
const writeStream = createWriteStream(outputPath);

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
    unlinkSync(inputPath);
  } catch (error) {
    console.error(`Error occurred while trying to delete: ${inputPath}. Error: `, error);
    process.exit(-1);
  }

  try {
    renameSync(outputPath, inputPath);
  } catch (error) {
    console.error(`Error occurred while trying to rename: ${outputPath}. Error: `, error);
    process.exit(-1);
  }
});
