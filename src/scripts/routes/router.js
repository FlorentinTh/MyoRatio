import { TypeHelper } from '../helpers/type-helper.js';

export class Router {
  #url;

  constructor() {
    this.#url = window.location.href;
  }

  switchPage(page) {
    TypeHelper.checkStringNotNull(page, { label: 'page' });

    window.history.pushState('', '', this.#url);
    window.location.replace(decodeURI(`${page}.html`));
  }

  disableBackButton() {
    window.location.hash = 'no-back-button';
    window.location.hash = 'Again-No-back-button';

    window.onhashchange = () => {
      window.location.hash = 'no-back-button';
    };
  }
}
