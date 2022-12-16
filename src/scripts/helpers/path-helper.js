import { TypeHelper } from '../helpers/type-helper.js';

const path = nw.require('path');

export class PathHelper {
  static sanitizePath(inputPath) {
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

    return path.normalize(inputPath).replace('/^(..[/\\])+/', '');
  }
}
