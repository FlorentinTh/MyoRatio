import { TypeHelper } from '../helpers/type-helper.js';

export class Router {
  #url;

  constructor() {
    this.#url = window.location.href;
  }

  switchPage(page) {
    if (TypeHelper.isUndefinedOrNull(page) || page === '') {
      throw new Error(`page parameter cannot be empty`);
    } else if (!TypeHelper.isString(page)) {
      throw new Error(
        `page parameter must be of type String. Received: ${TypeHelper.getType(page)}`
      );
    }

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
