class LoaderOverlay {
  #loaderElement;

  constructor() {
    this.#loaderElement = document.getElementById('loader-overlay');
  }

  toggle() {
    document.querySelector('body').classList.toggle('hide-overflow');
    this.#loaderElement.classList.toggle('not-visible');
    this.#loaderElement.classList.toggle('overlay-animate');
  }
}

export default new LoaderOverlay();
