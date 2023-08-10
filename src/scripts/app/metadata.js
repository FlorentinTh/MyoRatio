import { ErrorOverlay } from '../components/overlay.js';
import { FileHelper } from '../helpers/file-helper.js';
import { StringHelper } from '../helpers/string-helper.js';
import { TypeHelper } from '../helpers/type-helper.js';
import { Stage } from '../models/stage.js';
import { Configuration } from './configuration.js';

const fs = nw.require('fs');
const path = nw.require('path');

const readAppDataFile = new Promise((resolve, reject) => {
  const configuration = new Configuration();

  FileHelper.parseJSONFile(configuration.configurationFilePath)
    .then(result => {
      resolve(result);
    })
    .catch(error => {
      reject(error);
    });
});

export class Metadata {
  #stages = Object.values(Stage);
  #metadataRootFolder = '.metadata';
  #metadataFilename = 'data.json';
  #inputDataPath;
  #baseContent;

  constructor(inputDataPath) {
    TypeHelper.checkStringNotNull(inputDataPath, { label: 'inputDataPath' });
    this.#inputDataPath = inputDataPath;

    readAppDataFile
      .then(value => {
        this.#baseContent = value.analysis.map(item => item.label.trim().toLowerCase());
      })
      .catch(error => {
        if (error) {
          const errorOverlay = new ErrorOverlay({
            message: 'Application data error',
            details: error.message,
            interact: true
          });

          errorOverlay.show();
        }
      });
  }

  get getBaseContent() {
    return this.#baseContent;
  }

  get getMetadataRootFolder() {
    return path.join(this.#inputDataPath, 'Analysis', this.#metadataRootFolder);
  }

  async checkBaseFolderContent(converter = false) {
    TypeHelper.checkBoolean(converter, { label: 'converter' });

    let inputPath;

    if (converter) {
      inputPath = path.join(this.#inputDataPath, 'hpf');
    } else {
      inputPath = path.join(this.#inputDataPath, 'Analysis');
    }

    try {
      await fs.promises.readdir(inputPath);
    } catch (error) {
      throw new Error(error);
    }

    let folders;

    try {
      folders = await fs.promises.readdir(inputPath);

      folders = folders.filter(async file => {
        const stat = await fs.promises.stat(path.join(inputPath, file));
        return stat.isDirectory();
      });
    } catch (error) {
      throw new Error(error);
    }

    folders = folders.filter(item => item.toUpperCase() !== '.DS_STORE');
    folders = new Set(folders.map(element => element.toLowerCase()));

    for (const folder of folders) {
      if (!(folder === this.#metadataRootFolder) && !this.#baseContent.includes(folder)) {
        return false;
      }
    }

    return true;
  }

  async createMetadataFolderTree(analysis) {
    TypeHelper.checkStringNotNull(analysis, { label: 'analysis' });

    await FileHelper.createFileOrDirectoryIfNotExists(this.getMetadataRootFolder, {
      hidden: true
    });

    if (this.#baseContent.includes(analysis)) {
      const metadataSubfolderPath = path.join(this.getMetadataRootFolder, analysis);
      await FileHelper.createFileOrDirectoryIfNotExists(metadataSubfolderPath, {
        hidden: false
      });

      const metadataFilePath = path.join(metadataSubfolderPath, this.#metadataFilename);
      await FileHelper.createFileOrDirectoryIfNotExists(metadataFilePath, {
        isDirectory: false,
        hidden: false
      });

      await FileHelper.initEmptyJSONFile(metadataFilePath);
    } else {
      throw new Error(`Analysis ${analysis} is not expected`);
    }

    return true;
  }

  async createMetadataParticipantFolder(analysisType, participant) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkStringNotNull(participant, { label: 'participant' });

    const metadataParticipantFolderPath = path.join(
      this.getMetadataRootFolder,
      analysisType,
      participant
    );

    await FileHelper.createFileOrDirectoryIfNotExists(metadataParticipantFolderPath, {
      isDirectory: true,
      hidden: false
    });

    return true;
  }

  async initEmptyParticipantOject(path, content, participant, checksum) {
    const participantObject = {};

    const value = (participantObject[participant] = {
      checksum,
      complexity: 'unknown',
      auto_angles: false,
      invalid: false,
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

    content = { ...content, ...participantObject };
    await FileHelper.writeJSONFile(path, content);

    return value;
  }

  async getParticipantInfo(analysisType, participant) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkStringNotNull(participant, { label: 'participant' });

    const metadataFilePath = path.join(
      this.getMetadataRootFolder,
      analysisType,
      this.#metadataFilename
    );

    const metadataFileJSON = await FileHelper.parseJSONFile(metadataFilePath);

    const participantRecord = Object.keys(metadataFileJSON).filter(
      value => value === participant
    );

    const participantFolderName =
      StringHelper.revertParticipantNameFromSession(participant);

    const participantFolderPath = path.join(
      this.#inputDataPath,
      'Analysis',
      analysisType,
      participantFolderName
    );

    const files = await fs.promises.readdir(participantFolderPath);
    const checksumFile = files.filter(
      file => path.parse(file).ext.toLowerCase() === '.sha256sum'
    );

    if (checksumFile[0] === undefined) {
      throw new Error(`Cannot initialize participant: ${participantFolderName}`);
    }

    const checksum = path.parse(checksumFile[0]).name.split('.')[1];

    if (participantRecord.length > 0) {
      if (!(checksum === metadataFileJSON[participant].checksum)) {
        delete metadataFileJSON[participant];

        return await this.initEmptyParticipantOject(
          metadataFilePath,
          metadataFileJSON,
          participant,
          checksum
        );
      }

      return metadataFileJSON[participant];
    } else {
      return await this.initEmptyParticipantOject(
        metadataFilePath,
        metadataFileJSON,
        participant,
        checksum
      );
    }
  }

  async cleanParticipantMetadata(analysisType, participantsToKeep) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkArray(participantsToKeep, { label: 'participantsToKeep' });

    const metadataFilePath = path.join(
      this.getMetadataRootFolder,
      analysisType,
      this.#metadataFilename
    );

    participantsToKeep = participantsToKeep.map(participant =>
      StringHelper.formatParticipantName(participant)
    );

    const metadataFileJSON = await FileHelper.parseJSONFile(metadataFilePath);
    const cleanParticipants = Object.keys(metadataFileJSON).filter(
      participant => !participantsToKeep.includes(participant)
    );

    for (const cleanParticipant of cleanParticipants) {
      delete metadataFileJSON[cleanParticipant];

      const cleanParticipantMetadataFolderPath = path.join(
        path.parse(metadataFilePath).dir,
        StringHelper.revertParticipantNameFromSession(cleanParticipant)
      );

      try {
        await fs.promises.access(cleanParticipantMetadataFolderPath);
        await fs.promises.rm(cleanParticipantMetadataFolderPath, { recursive: true });
      } catch (error) {
        if (error.code === 'ENOENT') {
          continue;
        } else {
          throw new Error(error);
        }
      }
    }

    await FileHelper.writeJSONFile(metadataFilePath, metadataFileJSON);
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

    return path.join(this.getMetadataRootFolder, analysisType, participantFolderName);
  }

  #isAnglesExist(content, auto, metadata = false, iteration = 0) {
    TypeHelper.checkObject(content, { label: 'content' });
    TypeHelper.checkBoolean(auto, { label: 'auto' });
    TypeHelper.checkInt(iteration, { label: 'iteration' });

    let angles;

    if (auto) {
      angles = Object.values(Object.values(content)[iteration].points.auto);
    } else {
      angles = Object.values(Object.values(content)[iteration].points.manual);
    }

    let anglesExist = !!metadata;

    for (const angle of angles) {
      if (metadata) {
        if (angle.x === null && angle.y === null) {
          anglesExist = false;
        }
      } else {
        if (!(angle.x === null) && !(angle.y === null)) {
          anglesExist = true;
        }
      }
    }

    return anglesExist;
  }

  async writeContent(analysisType, participant, content, stage, override = false) {
    TypeHelper.checkStringNotNull(analysisType, { label: 'analysisType' });
    TypeHelper.checkStringNotNull(participant, { label: 'participant' });
    TypeHelper.checkObject(content, { label: 'content' });

    if (!TypeHelper.isUndefinedOrNull(stage)) {
      if (!TypeHelper.isString(stage)) {
        throw new Error(`stage parameter cannot be ${stage}`);
      }
    }

    const metadataFilePath = path.join(
      this.getMetadataRootFolder,
      analysisType,
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

        if (contentKey === 'iterations') {
          const currentIteration = parseInt(Object.keys(content[contentKey])[0]);

          if (!(mainContent[currentIteration] === undefined)) {
            const isMainAutoAnglesExist = this.#isAnglesExist(
              mainContent,
              true,
              true,
              currentIteration - 1
            );

            const isContentAutoAnglesExist = this.#isAnglesExist(
              content[contentKey],
              true
            );

            if (isMainAutoAnglesExist && !isContentAutoAnglesExist) {
              Object.values(content[contentKey])[0].points.auto =
                Object.values(mainContent)[currentIteration - 1].points.auto;
            }

            const isMainManualAnglesExist = this.#isAnglesExist(mainContent, false, true);
            const isContentManualAnglesExist = this.#isAnglesExist(
              content[contentKey],
              false
            );

            if (isMainManualAnglesExist && !isContentManualAnglesExist && !override) {
              Object.values(content[contentKey])[0].points.manual =
                Object.values(mainContent)[currentIteration - 1].points.manual;
            }
          }
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
}
