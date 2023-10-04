import '../../styles/components/menu.css';
import menuTemplate from '../../views/partials/components/menu.hbs';

import { TypeHelper } from '../helpers/type-helper.js';
import { PlatformHelper } from '../helpers/platform-helper.js';
import { ImageHelper } from '../helpers/image-helper';
import { LinkHelper } from '../helpers/link-helper.js';
import { PathHelper } from '../helpers/path-helper';

export class Menu {
  #toggleNavButton;
  #additionalButtons;

  constructor() {
    const menuContainer = document.querySelector('.menu-container');

    let isUpdateAvailable = false;
    let notifyUpdate = false;

    if ('update-available' in sessionStorage) {
      isUpdateAvailable =
        PathHelper.sanitizePath(
          sessionStorage.getItem('update-available').toString().toLowerCase().trim()
        ) === 'true';
    }

    if ('notify-update' in sessionStorage) {
      notifyUpdate =
        PathHelper.sanitizePath(
          sessionStorage.getItem('notify-update').toString().toLowerCase().trim()
        ) === 'true';
    }

    menuContainer.insertAdjacentHTML(
      'afterbegin',
      menuTemplate({ version: AppVersion, isUpdateAvailable, notifyUpdate })
    );

    this.#toggleNavButton = document.querySelector('.toggle-nav-btn');
    this.#additionalButtons = null;

    LinkHelper.openExternalLinks();
    ImageHelper.replaceImagesPath();
  }

  init(buttons) {
    if (
      !TypeHelper.isUndefinedOrNull(buttons) &&
      !TypeHelper.isNodeList(buttons) &&
      !TypeHelper.isChildOfHTMLElement(buttons)
    ) {
      throw new Error(
        `selectorButtons parameter must be of type NodeList or a child of HTMLElement. Receive: ${TypeHelper.getType(
          buttons
        )}`
      );
    }

    this.#toggleNavButton.addEventListener('click', () => {
      this.#toggle();
    });

    this.#additionalButtons = buttons;
    this.#setHPFConverterItem();

    if ('require-setup' in sessionStorage) {
      const requireSetup =
        PathHelper.sanitizePath(
          sessionStorage.getItem('require-setup').toString().toLowerCase().trim()
        ) === 'true';

      this.toggleItemDisabled('data-discovering', { disabled: requireSetup });
    }
  }

  #toggle() {
    document.querySelector('body').classList.toggle('nav-open');
    document.querySelector('nav').classList.toggle('open');
    document.querySelector('.content').classList.toggle('open');
    document.querySelector('.disable-content-overlay').classList.toggle('open');

    if (!TypeHelper.isChildOfHTMLElement(this.#additionalButtons)) {
      if (this.#additionalButtons?.length > 0) {
        for (const button of this.#additionalButtons) {
          button.classList.toggle('open');
        }
      }
    } else {
      this.#additionalButtons.classList.toggle('open');
    }

    this.#toggleNavButton.classList.toggle('open');
  }

  #setHPFConverterItem() {
    const HPFConverterLink = document.getElementById('hpf-converter');

    if (!PlatformHelper.isWindowsPlatform()) {
      HPFConverterLink.setAttribute('disabled', '');
      HPFConverterLink.classList.add('disabled');
    }
  }

  setItemActive(itemID) {
    TypeHelper.checkStringNotNull(itemID, { label: 'itemID' });

    const items = document.querySelectorAll('nav.menu ul li a');

    for (const item of items) {
      if (!(item.id === itemID)) {
        if (item.classList.contains('active')) {
          item.classList.remove('active');
        }
      } else {
        item.classList.add('active');
      }
    }
  }

  toggleItemDisabled(itemID, opts = { disabled: false }) {
    TypeHelper.checkStringNotNull(itemID, { label: 'itemID' });
    TypeHelper.checkObject(opts, { label: 'opts' });

    const defaultOpts = { disabled: false };
    opts = { ...defaultOpts, ...opts };

    const items = document.querySelectorAll('nav.menu ul li a');

    for (const item of items) {
      if (item.id === itemID) {
        if (opts.disabled) {
          if (!item.classList.contains('disabled')) {
            item.classList.add('disabled');
          } else {
            if (item.classList.contains('disabled')) {
              item.classList.remove('disabled');
            }
          }
        } else {
          if (item.classList.contains('disabled')) {
            item.classList.remove('disabled');
          }
        }
      }
    }
  }
}
