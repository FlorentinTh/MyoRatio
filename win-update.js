const fs = require('fs');
const readline = require('readline');
const path = require('path');

const pkg = require('./package.json');
const APP_VERSION = JSON.stringify(pkg.version);

const fileName = 'winx64-installer.iss';
const inputPath = path.normalize(`./${fileName}`);
const outputPath = path.normalize(`./${fileName}.lock`);

const readStream = fs.createReadStream(inputPath);
const writeStream = fs.createWriteStream(outputPath);

// deepcode ignore MissingClose
const lineReader = readline.createInterface({
  input: readStream,
  output: writeStream,
  crlfDelay: Infinity
});

lineReader.on('line', line => {
  if (line.includes('#define MyAppVersion')) {
    const updatedLine = line.replace(/"(.*?)"/g, `"${APP_VERSION}"`);
    writeStream.write(updatedLine + '\n');
  } else {
    writeStream.write(line + '\n');
  }
});

lineReader.on('close', () => {
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
