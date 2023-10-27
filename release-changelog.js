const fs = require('fs');
const readline = require('readline');
const path = require('path');

const FILENAME = 'CHANGELOG.md';
const FILE_HEADER_END_LINE = 4;

const inputPath = path.normalize(`./${FILENAME}`);
const outputPath = path.normalize(`./${FILENAME}.tmp`);

const readStream = fs.createReadStream(inputPath);
const writeStream = fs.createWriteStream(outputPath);

const lineReader = readline.createInterface({
  input: readStream,
  output: writeStream,
  crlfDelay: Infinity
});

const versionHeaderPattern = /\[\d+\.\d+(\.\d+)?\]/;

let versionHeaderFound = 0;
let lineNumber = 0;

lineReader.on('line', line => {
  lineNumber += 1;

  if (lineNumber > FILE_HEADER_END_LINE) {
    if (versionHeaderPattern.test(line)) {
      versionHeaderFound += 1;
    }

    if (versionHeaderFound < 2) {
      writeStream.write(line + '\n');
    }
  }
});

lineReader.on('close', () => {
  lineReader.close();
  readStream.close();
  writeStream.close();
});
