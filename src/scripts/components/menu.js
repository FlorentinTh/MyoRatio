import '../../styles/components/menu.css';
import menuTemplate from '../../views/partials/components/menu.hbs';

import { TypeHelper } from '../helpers/type-helper.js';

// eslint-disable-next-line no-undef
const path = nw.require('path');
// eslint-disable-next-line no-undef
const exec = nw.require('child_process').execFile;

export class Menu {
  #toggleNavButton;
  #additionalButtons;

  constructor() {
    const menuContainer = document.querySelector('.menu-container');
    menuContainer.innerHTML = menuTemplate();

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
    const basePath = process.env.INIT_CWD ?? process.cwd();
    const delsysExecutablePath = path.join(basePath, 'bin', 'DelsysFileUtil.exe');

    document.getElementById('hpf-converter').addEventListener('click', () => {
      this.#toggle();

      exec(delsysExecutablePath, err => {
        if (err) {
          throw new Error(err);
        }
      });
    });
  }
}
