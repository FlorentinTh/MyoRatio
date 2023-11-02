const { readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const pkg = require('./package.json');
const { unlinkSync, renameSync } = require('node:fs');

const APP_VERSION = '4.0.0'; // JSON.stringify(pkg.version);
const FILENAME = 'README.md';

const inputFilePath = join('./docs', FILENAME);
const outputFilePath = join('./docs', `${FILENAME}.tmp`);

readFile(inputFilePath, { encoding: 'utf8' })
  .then(content => {
    const markdownLines = content.split(/\r\n|\r|\n/g);

    for (let i = 0; i < markdownLines.length; i++) {
      if (markdownLines[i].startsWith('[![macOs Download]')) {
        const downloadButtons = markdownLines[i]
          .split(/(?=\[!)/g)
          .map(item => item.trim());

        for (let j = 0; j < downloadButtons.length; j++) {
          const replacedTag = downloadButtons[j].replace(
            /v\d+(\.\d+){1,2}/,
            `v${APP_VERSION.replace(/"/g, '')}`
          );

          const newButton = replacedTag.replace(
            /_\d+(\.\d+){1,2}_/,
            `_${APP_VERSION.replace(/"/g, '')}_`
          );

          downloadButtons[j] = newButton;
        }

        markdownLines[i] = downloadButtons.join(' ');
      }
    }

    writeFile(outputFilePath, markdownLines.join('\n'), { encoding: 'utf8' })
      .then(() => {
        try {
          unlinkSync(inputFilePath);
        } catch (error) {
          console.error(error);
          process.exit(-1);
        }

        try {
          renameSync(outputFilePath, inputFilePath);
        } catch (error) {
          console.error(error);
          process.exit(-1);
        }
      })
      .catch(error => {
        console.error(error);
        process.exit(-1);
      });
  })
  .catch(error => {
    console.error(error);
    process.exit(-1);
  });
