import { PlatformHelper } from './platform-helper';
import { TypeHelper } from './type-helper';

const path = nw.require('path');

export class ImageHelper {
  static replaceImagesPath(selector = 'img') {
    TypeHelper.checkStringNotNull(selector, { label: 'selector' });

    const images = document.querySelectorAll(selector);
    let basePath;

    for (const image of images) {
      if (PlatformHelper.isWindowsPlatform()) {
        basePath = nw.App.startPath;
      } else if (PlatformHelper.isMacOsPlatform()) {
        basePath = process.env.INIT_CWD ?? process.cwd();
      }

      const imagePathArray = image.src.split('/');
      const filePath = imagePathArray[imagePathArray.length - 1];

      image.src = path.join(basePath, 'build', 'public', 'assets', 'img', filePath);
    }
  }
}
