// eslint-disable-next-line no-undef
const os = nw.require('os');

export class PlatformHelper {
  static isWindowsPlatform() {
    return os.platform() === 'win32';
  }
}
