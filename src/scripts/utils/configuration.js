import * as yup from 'yup';
import { ErrorOverlay } from '../components/overlay';
import { FileHelper } from '../helpers/file-helper';

const path = nw.require('path');

export class Configuration {
  static async load() {
    const configurationFilePath = path.join(
      process.env.INIT_CWD ?? process.cwd(),
      'env.json'
    );

    const schema = yup.object().shape({
      HOST: yup.string().required(),
      PORT: yup.number().required().positive().integer(),
      API_KEY: yup.string().required()
    });

    let configurationFileObject;
    try {
      configurationFileObject = await FileHelper.parseJSONFile(configurationFilePath);
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: 'Cannot find configuration file',
        details: error.message
      });

      errorOverlay.show();
    }

    const valid = await schema.isValid(configurationFileObject);
    if (!valid) {
      const errorOverlay = new ErrorOverlay({
        message: 'Configuration Error',
        details: 'The configuration file cannot be validated'
      });

      errorOverlay.show();
    }

    return configurationFileObject;
  }
}
