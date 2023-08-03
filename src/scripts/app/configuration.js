import { FileHelper } from '../helpers/file-helper';
import { TypeHelper } from '../helpers/type-helper';

const os = nw.require('os');
const path = nw.require('path');

export class Configuration {
  #homeConfigurationFolderPath;
  #configurationFilePath;
  #configuration;

  constructor() {
    this.#homeConfigurationFolderPath = path.join(os.homedir(), '.myoratio');
    this.#configurationFilePath = path.join(
      this.#homeConfigurationFolderPath,
      'app-data.json'
    );
  }

  get homeConfigurationFolderPath() {
    return this.#homeConfigurationFolderPath;
  }

  get configurationFilePath() {
    return this.#configurationFilePath;
  }

  async load() {
    try {
      this.#configuration = await FileHelper.parseJSONFile(this.#configurationFilePath);
    } catch (error) {
      throw new Error(error);
    }

    return this.#configuration;
  }

  async getRequestConfigurationByAnalysis(analysis) {
    TypeHelper.checkStringNotNull(analysis, { label: 'analysis' });

    if (!(this.#configuration === undefined)) {
      const analysisObject = this.#configuration.analysis.find(
        item => item.label.toLowerCase() === analysis
      );

      const muscles = {};

      for (const muscle of this.#configuration.muscles) {
        muscles[muscle.id] = muscle.label;
      }

      analysisObject.muscles.antagonist =
        muscles[analysisObject.muscles.antagonist].toLowerCase();

      analysisObject.muscles.agonist =
        muscles[analysisObject.muscles.agonist].toLowerCase();

      analysisObject.muscles.angle = muscles[analysisObject.muscles.angle].toLowerCase();

      return analysisObject;
    } else {
      throw new Error('Please ensure that the configuration has been loaded first');
    }
  }
}
