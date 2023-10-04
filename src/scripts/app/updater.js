import { Configuration } from './configuration.js';
import { PlatformHelper } from '../helpers/platform-helper.js';

import { SemVer } from 'semver';
import Swal from 'sweetalert2';

const https = nw.require('https');
const fs = nw.require('fs');
const path = nw.require('path');
const { spawn, execSync } = nw.require('child_process');

export class Updater {
  #currentVersion;

  constructor(currentVersion) {
    this.#currentVersion = new SemVer(currentVersion);
  }

  async #getLatestRelease() {
    const repositoryUrlArray = RepositoryUrl.replace(/^https:\/\//, '')
      .replace('.git', '')
      .split('/');

    try {
      const request = await fetch(
        `https://api.${repositoryUrlArray[0]}/repos/${repositoryUrlArray[1]}/${repositoryUrlArray[2]}/releases/latest`,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET'
        }
      );

      return await request.json();
    } catch (error) {
      return undefined;
    }
  }

  async checkUpdateAvailable() {
    const latestRelease = await this.#getLatestRelease();

    if (latestRelease === undefined) {
      return false;
    }

    const latestReleaseVersion = new SemVer(latestRelease.tag_name.substring(1));

    if (
      this.#currentVersion.compare(latestReleaseVersion) === -1 &&
      !latestRelease.draft &&
      !latestRelease.prerelease
    ) {
      return true;
    }

    return false;
  }

  #downloadUpdate(url, file) {
    const request = https.get(url, response => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return this.#downloadUpdate(response.headers.location, file);
      }

      response.pipe(file);
    });

    request.on('error', err => {
      fs.unlink(file, () => console.log(err.message));
    });
  }

  async updateApp() {
    Swal.fire({
      title: 'Downloading new update',
      background: '#ededed',
      padding: '0 0 25px 0',
      allowOutsideClick: false,
      showConfirmButton: false,
      showCancelButton: false,
      showDenyButton: false
    });

    Swal.showLoading();

    const latestRelease = await this.#getLatestRelease();
    const assets = latestRelease.assets;

    let platform;
    let ext;

    if (PlatformHelper.isWindowsPlatform()) {
      platform = 'winx64';
      ext = 'exe';
    } else if (PlatformHelper.isMacOsPlatform()) {
      platform = 'macx64';
      ext = 'dmg';
    }

    let updateFileURL;

    for (const asset of assets) {
      const assetExt = asset.name.split('.').pop();
      if (ext === assetExt && asset.name.includes(platform)) {
        updateFileURL = asset.browser_download_url;
        break;
      }
    }

    const configuration = new Configuration();
    const filename = path.parse(updateFileURL).base;

    const filePath = path.join(
      configuration.homeConfigurationFolderPath,
      `Update_${filename}`
    );

    const file = fs.createWriteStream(filePath);

    this.#downloadUpdate(updateFileURL, file);

    file.on('finish', () => {
      file.close();
      Swal.close();

      Swal.fire({
        title: 'Download complete',
        icon: 'success',
        background: '#ededed',
        customClass: {
          confirmButton: 'button-popup cancel'
        },
        buttonsStyling: false,
        padding: '0 0 35px 0',
        allowOutsideClick: false,
        showCancelButton: false,
        showDenyButton: false,
        confirmButtonText: `Restart and update`,
        preConfirm: () => {
          const confirmButton = Swal.getConfirmButton();
          confirmButton.replaceChildren();
          confirmButton.insertAdjacentHTML(
            'afterbegin',
            `<span class="spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            <span class="submit-label">Restart and update</span>`
          );
          confirmButton.setAttribute('disabled', '');

          return new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 300);
          });
        }
      })
        .then(async result => {
          if (result.isConfirmed) {
            sessionStorage.removeItem('update-available');
            sessionStorage.removeItem('notify-update');
            localStorage.setItem('new-version-installed', true);
            Swal.close();

            if (PlatformHelper.isWindowsPlatform()) {
              const subprocess = spawn(filePath, [], {
                detached: true,
                stdio: 'ignore'
              });

              subprocess.unref();
            } else if (PlatformHelper.isMacOsPlatform()) {
              execSync(`hdiutil attach ${filePath}`);
              execSync(`open /Volumes/${AppName}`);
            }

            nw.App.quit();
          }
        })
        .catch(error => {
          throw new Error(error);
        });
    });

    file.on('error', err => {
      fs.unlink(file, () => console.log(err.message));

      Swal.fire({
        title: 'Download complete',
        icon: 'error',
        background: '#ededed',
        customClass: {
          confirmButton: 'button-popup confirm'
        },
        buttonsStyling: false,
        padding: '0 0 35px 0',
        allowOutsideClick: false,
        showCancelButton: true,
        showDenyButton: false,
        showConfirmButton: false,
        cancelButtonText: `Try again later`
      })
        .then(async result => {
          if (!result.isConfirmed) {
            Swal.close();
          }
        })
        .catch(error => {
          throw new Error(error);
        });
    });
  }
}
