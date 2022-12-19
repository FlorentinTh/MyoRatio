import { TypeHelper } from '../helpers/type-helper.js';

const path = nw.require('path');

export class PathHelper {
  static sanitizePath(inputPath) {
    TypeHelper.checkStringNotNull(inputPath, { label: 'inputPath' });

    return path.normalize(inputPath).replace('/^(..[/\\])+/', '');
  }
}
