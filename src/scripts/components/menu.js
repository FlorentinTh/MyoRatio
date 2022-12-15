import '../../styles/components/menu.css';
import menuTemplate from '../../views/partials/components/menu.hbs';

import { TypeHelper } from '../helpers/type-helper.js';
import { PlatformHelper } from '../helpers/platform-helper.js';
import { ErrorOverlay } from '../components/error-overlay.js';

// eslint-disable-next-line no-undef
const path = nw.require('path');
// eslint-disable-next-line no-undef
const { execFile } = nw.require('child_process');

export class Menu {
  #toggleNavButton;
  #additionalButtons;

  constructor() {
    const menuContainer = document.querySelector('.menu-container');
    menuContainer.insertAdjacentHTML('afterbegin', menuTemplate());

    this.#toggleNavButton = document.querySelector('.toggle-nav-btn');
    this.#additionalButtons = null;
  }

  init(buttons) {
    if (!TypeHelper.isUndefinedOrNull(buttons) && !TypeHelper.isNodeList(buttons)) {
      if (!TypeHelper.isChildOfHTMLElement(buttons)) {
        throw new Error(
          `selectorButtons parameter must be of type NodeList or a child of HTMLElement. Receive: ${TypeHelper.getType(
            buttons
          )}`
        );
      }
    }

    this.#toggleNavButton.addEventListener('click', () => {
      this.#toggle();
    });

    this.#additionalButtons = buttons;
    this.#setHPFConverterItem();
  }

  #toggle() {
    document.querySelector('body').classList.toggle('nav-open');
    document.querySelector('nav').classList.toggle('open');
    document.querySelector('.content').classList.toggle('open');

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

    if (PlatformHelper.isWindowsPlatform()) {
      const basePath = process.env.INIT_CWD ?? process.cwd();
      const delsysExecutablePath = path.join(basePath, 'bin', 'DelsysFileUtil.exe');

      HPFConverterLink.addEventListener('click', () => {
        this.#toggle();

        execFile(delsysExecutablePath, err => {
          if (err) {
            const errorOverlay = new ErrorOverlay({
              message: 'Cannot launch converter',
              details: err.message,
              interact: true
            });

            errorOverlay.show();
          }
        });
      });
    } else {
      HPFConverterLink.setAttribute('disabled', '');
    }
  }
}
