import { FileHelper } from '../helpers/file-helper.js';
import { StringHelper } from '../helpers/string-helper.js';
import { TypeHelper } from '../helpers/type-helper.js';

const path = nw.require('path');
const fs = nw.require('fs');

export class Metadata {
  #baseContent = ['flexion', 'extension', 'sit-stand'];
  #stages = ['concentric', 'eccentric'];
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

  async createMetadataParticipantFolder(analysisType, participants) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkArray(participants, { label: 'participants' });

    if (participants.length > 0) {
      for (const participant of participants) {
        const metadataParticipantFolderPath = path.join(
          this.#inputDataPath,
          this.#metadataRootFolder,
          `.${analysisType}`,
          participant
        );

        await FileHelper.createFileOrDirectoryIfNotExists(metadataParticipantFolderPath, {
          isDirectory: true,
          hidden: false
        });
      }
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
        complexity: 'unknown',
        auto_angles: false,
        stages: {}
      });

      for (const stage of this.#stages) {
        const stageObject = {};

        stageObject[stage] = {
          completed: false
        };

        value.stages = {
          ...value.stages,
          ...stageObject
        };
      }

      metadataFileJSON = { ...metadataFileJSON, ...participantObject };
      await FileHelper.writeJSONFile(metadataFilePath, metadataFileJSON);

      return value;
    }
  }

  async getParticipantFolderPath(
    analysisType,
    participant,
    opts = { fromSession: false }
  ) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkStringNotNull(participant, { label: 'participant' });

    const defaultOpts = { fromSession: false };
    opts = { ...defaultOpts, ...opts };

    TypeHelper.checkBoolean(opts.fromSession, { label: 'fromSession' });

    let participantFolderName;

    if (opts.fromSession) {
      participantFolderName = StringHelper.revertParticipantNameFromSession(participant);
    } else {
      participantFolderName = participant.split('_')[0];
    }

    return path.join(
      this.#inputDataPath,
      this.#metadataRootFolder,
      `.${analysisType}`,
      participantFolderName
    );
  }

  async writeContent(analysisType, participant, content, stage) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkStringNotNull(participant, { label: 'participant' });
    TypeHelper.checkObject(content, { label: 'content' });

    if (!TypeHelper.isUndefinedOrNull(stage)) {
      if (!TypeHelper.isString(stage)) {
        throw new Error(`stage parameter cannot be ${stage}`);
      }
    }

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

    let JSONFileStageObject;
    let JSONFileStageObjectKeys;

    if (!TypeHelper.isUndefinedOrNull(stage)) {
      JSONFileStageObject = metadataFileJSON[participant].stages;
      JSONFileStageObjectKeys = Object.keys(JSONFileStageObject[stage]);
    }

    const output = {};

    for (const contentKey of contentKeys) {
      if (
        TypeHelper.isObject(content[contentKey]) &&
        (JSONFileParticipantObjectKeys.includes(contentKey) ||
          JSONFileStageObjectKeys.includes(contentKey))
      ) {
        const keyContentObject = {};
        let mainContent;

        if (TypeHelper.isUndefinedOrNull(stage)) {
          mainContent = JSONFileParticipantObject[contentKey];
        } else {
          mainContent = JSONFileStageObject[stage][contentKey];
        }

        keyContentObject[contentKey] = {
          ...mainContent,
          ...content[contentKey]
        };

        if (TypeHelper.isUndefinedOrNull(stage)) {
          output[participant] = {
            ...JSONFileParticipantObject,
            ...keyContentObject
          };
        } else {
          output[participant] = {
            ...JSONFileParticipantObject,
            stages: {
              ...JSONFileStageObject
            }
          };

          output[participant].stages[stage] = {
            ...JSONFileStageObject[stage],
            ...keyContentObject
          };
        }
      } else {
        let mainContent;

        if (TypeHelper.isUndefinedOrNull(stage)) {
          mainContent = JSONFileParticipantObject;

          output[participant] = {
            ...mainContent,
            ...content
          };
        } else {
          output[participant] = {
            ...JSONFileParticipantObject,
            stages: {
              ...JSONFileStageObject
            }
          };

          output[participant].stages[stage] = {
            ...JSONFileStageObject[stage],
            ...content
          };
        }
      }

      metadataFileJSON = { ...metadataFileJSON, ...output };
      await FileHelper.writeJSONFile(metadataFilePath, metadataFileJSON);
    }
  }

  async writeHTMLReport(analysisType, content) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkStringNotNull(content, { label: 'content' });

    const reportOutputPath = path.join(
      this.#inputDataPath,
      this.#metadataRootFolder,
      `.${analysisType}`,
      `${analysisType}_report.html`
    );

    await FileHelper.writeFile(reportOutputPath, content);
  }
}
