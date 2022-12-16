import { PlatformHelper } from '../helpers/platform-helper.js';
import { TypeHelper } from '../helpers/type-helper.js';

const fs = nw.require('fs');
const { execSync } = nw.require('child_process');

const checkInputPath = inputPath => {
  if (TypeHelper.isUndefinedOrNull(inputPath)) {
    throw new Error(`inputPath parameter cannot be ${inputPath}`);
  } else if (inputPath === '') {
    throw new Error(`inputPath parameter cannot be an empty String`);
  } else if (!TypeHelper.isString(inputPath)) {
    throw new Error(
      `inputPath parameter must be of type String. Received: ${TypeHelper.getType(
        inputPath
      )}`
    );
  }
};

export class FileHelper {
  static async createFileOrDirectoryIfNotExists(
    inputPath,
    opts = { isDirectory: true, hidden: false }
  ) {
    checkInputPath(inputPath);

    const defaultOpts = { isDirectory: true, hidden: false };
    opts = { ...defaultOpts, ...opts };

    if (!TypeHelper.isBoolean(opts.isDirectory)) {
      throw new Error(
        `isDirectory parameter must be of type Boolean. Receive: ${TypeHelper.getType(
          opts.isDirectory
        )}`
      );
    }

    if (!TypeHelper.isBoolean(opts.hidden)) {
      throw new Error(
        `hidden parameter must be of type Boolean. Receive: ${TypeHelper.getType(
          opts.hidden
        )}`
      );
    }

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
    checkInputPath(inputPath);
    try {
      const file = await fs.promises.readFile(inputPath);

      if (!(file.length > 0)) {
        await fs.promises.writeFile(inputPath, JSON.stringify({}));
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  static setHiddenFileOrFolder(inputPath) {
    checkInputPath(inputPath);

    if (PlatformHelper.isWindowsPlatform()) {
      const exec = execSync(`attrib +h ${inputPath}`);
      if (!(exec.toString() === '')) {
        throw new Error(`Cannot hide ${inputPath}`);
      }
    }
  }
}
