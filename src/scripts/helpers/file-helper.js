import { PlatformHelper } from '../helpers/platform-helper.js';
import { TypeHelper } from '../helpers/type-helper.js';

const fs = nw.require('fs');
const { execSync } = nw.require('child_process');

export class FileHelper {
  static async createFileOrDirectoryIfNotExists(
    inputPath,
    opts = { isDirectory: true, hidden: false }
  ) {
    TypeHelper.checkStringNotNull(inputPath, { label: 'inputPath' });

    const defaultOpts = { isDirectory: true, hidden: false };
    opts = { ...defaultOpts, ...opts };

    TypeHelper.checkBoolean(opts.isDirectory, { label: 'isDirectory' });
    TypeHelper.checkBoolean(opts.hidden, { label: 'hidden' });

    try {
      await fs.promises.access(inputPath, fs.constants.F_OK);
    } catch (error) {
      if (error.code === 'ENOENT') {
        try {
          if (opts.isDirectory) {
            await fs.promises.mkdir(inputPath);
          } else {
            await fs.promises.open(inputPath, 'a+');
          }

          if (opts.hidden) {
            try {
              FileHelper.setHiddenFileOrFolder(inputPath);
            } catch (error) {
              throw new Error(error);
            }
          }
        } catch (error) {
          throw new Error(error);
        }
      } else {
        throw new Error(error);
      }
    }
  }

  static async initEmptyJSONFile(inputPath) {
    TypeHelper.checkStringNotNull(inputPath, { label: 'inputPath' });
    try {
      const file = await fs.promises.readFile(inputPath);

      if (!(file.length > 0)) {
        await fs.promises.writeFile(inputPath, JSON.stringify({}));
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  static async writeJSONFile(inputPath, content) {
    TypeHelper.checkStringNotNull(inputPath, { label: 'inputPath' });
    TypeHelper.checkObject(content, { label: 'content' });

    try {
      await fs.promises.writeFile(inputPath, JSON.stringify(content));
    } catch (error) {
      throw new Error(error);
    }
  }

  static async parseJSONFile(inputPath) {
    TypeHelper.checkStringNotNull(inputPath, { label: 'inputPath' });

    let metadataFile;
    try {
      metadataFile = await fs.promises.readFile(inputPath, 'utf8');
    } catch (error) {
      throw new Error(error);
    }
    return JSON.parse(metadataFile);
  }

  static setHiddenFileOrFolder(inputPath) {
    TypeHelper.checkStringNotNull(inputPath, { label: 'inputPath' });

    if (PlatformHelper.isWindowsPlatform()) {
      const exec = execSync(`attrib +h ${inputPath}`);
      if (!(exec.toString() === '')) {
        throw new Error(`Cannot hide ${inputPath}`);
      }
    }
  }
}
