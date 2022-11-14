class Router {
  #url;

  constructor() {
    this.#url = window.location.href;
  }

  switchPage(page) {
    window.history.pushState('', '', this.#url);
    window.location.replace(decodeURI(page));
  }
}

export default new Router();
