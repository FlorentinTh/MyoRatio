const os = nw.require('os');

export class PlatformHelper {
  static isWindowsPlatform() {
    return os.platform() === 'win32';
  }

  static isMacOsPlatform() {
    return os.platform() === 'darwin';
  }
}
