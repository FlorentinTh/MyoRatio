import { TypeHelper } from './type-helper';

const path = nw.require('path');
const fs = nw.require('fs');
const readline = nw.require('readline');
const { once } = nw.require('events');
const { spawn } = nw.require('child_process');

export class CSVHelper {
  static async convertFromHPF(fileInput) {
    TypeHelper.checkString(fileInput, { label: 'fileInput' });

    const converterExecutablePath = path.join(
      nw.App.startPath,
      'bin',
      'DelsysFileUtil.exe'
    );

    return new Promise((resolve, reject) => {
      let cmd;

      try {
        cmd = spawn(`"${converterExecutablePath}" -nogui -o CSV -i ${fileInput}`, [], {
          shell: true
        });
      } catch (error) {
        reject(error);
      }

      let result = '';
      let error = '';

      cmd.stdout.on('data', data => {
        console.log('out', data);
        result += data;
      });

      cmd.stderr.on('data', data => {
        console.log('err', data);
        error += data;
      });

      cmd.on('close', code => {
        if (code === 0) {
          resolve(result);
        } else {
          reject(error);
        }
      });
    });
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
