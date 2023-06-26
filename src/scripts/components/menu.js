import '../../styles/components/menu.css';
import menuTemplate from '../../views/partials/components/menu.hbs';

import { TypeHelper } from '../helpers/type-helper.js';
import { PlatformHelper } from '../helpers/platform-helper.js';
import { ImageHelper } from '../helpers/image-helper';
import { LinkHelper } from '../helpers/link-helper.js';

export class Menu {
  #toggleNavButton;
  #additionalButtons;

  constructor() {
    const menuContainer = document.querySelector('.menu-container');
    menuContainer.insertAdjacentHTML('afterbegin', menuTemplate({ version: AppVersion }));

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
}
