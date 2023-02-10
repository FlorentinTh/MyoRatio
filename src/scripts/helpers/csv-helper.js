import { TypeHelper } from './type-helper';

import cmd from '../../libs/node-run-cmd.js';

const path = nw.require('path');
const fs = nw.require('fs');
const readline = nw.require('readline');
const { once } = nw.require('events');

export class CSVHelper {
  static async convertFromHPF(fileInput) {
    TypeHelper.checkString(fileInput, { label: 'fileInput' });

    const basePath = process.env.INIT_CWD ?? process.cwd();
    const delsysExecutablePath = path.join(basePath, 'bin', 'DelsysFileUtil.exe');

    try {
      await cmd.run(`${delsysExecutablePath} -nogui -o CSV -i ${fileInput}`);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async normalize(fileInput, fileOutput) {
    TypeHelper.checkString(fileInput, { label: 'fileInput' });
    TypeHelper.checkString(fileOutput, { label: 'fileOutput' });

    const fileStream = fs.createReadStream(fileInput, { encoding: 'utf-8' });
    const writeStream = fs.createWriteStream(fileOutput, { encoding: 'utf-8' });

    try {
      const readLine = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      let lineCount = 0;

      readLine.on('line', line => {
        if (lineCount > 0) {
          line = line.replace(/,/g, '.');
          line = line.replace(/'/g, '.');
          line = line.replace(/(?<=\d)\s(?=\d)/g, '.');
        }

        line = line.replace(/;/g, ',');
        writeStream.write(`${line}\n`);
        lineCount++;
      });

      await once(readLine, 'close');
      writeStream.end();
    } catch (error) {
      throw new Error(error);
    }
  }
}
