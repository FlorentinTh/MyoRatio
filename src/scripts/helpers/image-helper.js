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
        basePath = path.join(nw.App.startPath, 'build', 'public');
      } else if (PlatformHelper.isMacOsPlatform()) {
        if (process.env.NODE_ENV === 'development') {
          basePath = 'public';
        } else {
          basePath = '.';
        }
      }

      const imagePathArray = image.src.split('/');
      const filePath = imagePathArray[imagePathArray.length - 1];

      image.src = path.join(basePath, 'assets', 'img', filePath);
    }
  }
}
