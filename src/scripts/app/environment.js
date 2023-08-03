import * as yup from 'yup';
import { ErrorOverlay } from '../components/overlay';
import configurationFile from '../../../env.app.json';

export class Environment {
  static async load() {
    const schema = yup.object().shape({
      HOST: yup.string().required(),
      PORT: yup.number().required().positive().integer(),
      API_KEY: yup.string().required()
    });

    const valid = await schema.isValid(configurationFile);
    if (!valid) {
      const errorOverlay = new ErrorOverlay({
        message: 'Configuration error',
        details: 'the configuration of the application is not valid',
        interact: true
      });

      errorOverlay.show();
      return;
    }

    return configurationFile;
  }
}
