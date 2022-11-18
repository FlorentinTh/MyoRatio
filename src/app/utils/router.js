class Router {
  #url;

  constructor() {
    this.#url = window.location.href;
  }

  switchPage(page) {
    window.history.pushState('', '', this.#url);
    window.location.replace(decodeURI(page));
  }

  disableBackButton() {
    window.location.hash = 'no-back-button';
    window.location.hash = 'Again-No-back-button';

    window.onhashchange = function () {
      window.location.hash = 'no-back-button';
    };
  }
}

export default new Router();
