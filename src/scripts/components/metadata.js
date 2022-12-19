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
    TypeHelper.checkStringNotNull(inputDataPath, { label: 'inputDataPath' });
    this.#inputDataPath = inputDataPath;
  }

  get getBaseContent() {
    return this.#baseContent;
  }

  get getMetadataRootFolder() {
    return this.#metadataRootFolder;
  }

  async checkBaseFolderContent() {
    let folders;
    try {
      folders = await fs.promises.readdir(this.#inputDataPath);

      folders = folders.filter(async file => {
        const stat = await fs.promises.stat(path.join(this.#inputDataPath, file));
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

  async getParticipantInfo(analysisType, participant) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkStringNotNull(participant, { label: 'participant' });

    const metadataFilePath = path.join(
      this.#inputDataPath,
      this.#metadataRootFolder,
      `.${analysisType}`,
      this.#metadataFilename
    );

    let metadataFileJSON = await FileHelper.parseJSONFile(metadataFilePath);

    const participantRecord = Object.keys(metadataFileJSON).filter(
      value => value === participant
    );

    if (participantRecord.length > 0) {
      return metadataFileJSON[participant];
    } else {
      const participantObject = {};

      const value = (participantObject[participant] = {
        completed: false,
        complexity: 'unknown',
        auto_angles: false
      });

      metadataFileJSON = { ...metadataFileJSON, ...participantObject };
      await FileHelper.writeJSONFile(metadataFilePath, metadataFileJSON);

      return value;
    }
  }

  async writeContent(analysisType, participant, content) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkStringNotNull(participant, { label: 'participant' });
    TypeHelper.checkObject(content, { label: 'content' });

    const metadataFilePath = path.join(
      this.#inputDataPath,
      this.#metadataRootFolder,
      `.${analysisType}`,
      this.#metadataFilename
    );

    let metadataFileJSON = await FileHelper.parseJSONFile(metadataFilePath);

    const contentKeys = Object.keys(content);
    const JSONFileParticipantObject = metadataFileJSON[participant];
    const JSONFileParticipantObjectKeys = Object.keys(JSONFileParticipantObject);

    const output = {};

    for (const contentKey of contentKeys) {
      if (
        TypeHelper.isObject(content[contentKey]) &&
        JSONFileParticipantObjectKeys.includes(contentKey)
      ) {
        const keyContentObject = {};
        keyContentObject[contentKey] = {
          ...JSONFileParticipantObject[contentKey],
          ...content[contentKey]
        };

        output[participant] = {
          ...JSONFileParticipantObject,
          ...keyContentObject
        };
      } else {
        output[participant] = {
          ...JSONFileParticipantObject,
          ...content
        };
      }

      metadataFileJSON = { ...metadataFileJSON, ...output };
      await FileHelper.writeJSONFile(metadataFilePath, metadataFileJSON);
    }
  }
}
