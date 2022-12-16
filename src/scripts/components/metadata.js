import { FileHelper } from '../helpers/file-helper.js';
import { TypeHelper } from '../helpers/type-helper.js';

const path = nw.require('path');
const fs = nw.require('fs');

export class Metadata {
  #baseContent = ['flexion', 'extension', 'sit-stand'];
  #metadataRootFolder = '.metadata';
  #metadataFilename = '.data.json';
  #inputDataPath;

  constructor(inputDataPath) {
    if (TypeHelper.isUndefinedOrNull(inputDataPath)) {
      throw new Error(`inputDataPath parameter cannot be ${inputDataPath}`);
    } else if (inputDataPath === '') {
      throw new Error(`inputDataPath parameter cannot be an empty String`);
    } else if (!TypeHelper.isString(inputDataPath)) {
      throw new Error(
        `inputDataPath parameter must be of type String. Received: ${TypeHelper.getType(
          inputDataPath
        )}`
      );
    }

    this.#inputDataPath = inputDataPath;
  }

  get getBaseContent() {
    return this.#baseContent;
  }

  async checkBaseFolderContent() {
    let folders;
    try {
      folders = await fs.promises.readdir(this.#inputDataPath);

      folders = folders.filter(file => {
        const stat = fs.statSync(path.join(this.#inputDataPath, file));
        return stat.isDirectory();
      });
    } catch (error) {
      throw new Error(error);
    }

    folders = new Set(folders.map(element => element.toLowerCase()));

    for (const element of this.#baseContent) {
      if (!folders.has(element)) {
        throw new Error('Input data folder does not meet file structure requirements');
      }
    }
  }

  async createMetadataFolderTree() {
    const metadataFolderPath = path.join(this.#inputDataPath, this.#metadataRootFolder);
    await FileHelper.createFileOrDirectoryIfNotExists(metadataFolderPath, {
      hidden: true
    });

    for (const folder of this.#baseContent) {
      const metadataSubfolderPath = path.join(metadataFolderPath, `.${folder}`);
      await FileHelper.createFileOrDirectoryIfNotExists(metadataSubfolderPath, {
        hidden: true
      });

      const metadataFilePath = path.join(metadataSubfolderPath, this.#metadataFilename);
      await FileHelper.createFileOrDirectoryIfNotExists(metadataFilePath, {
        isDirectory: false,
        hidden: false
      });

      await FileHelper.initEmptyJSONFile(metadataFilePath);
    }
  }
}
