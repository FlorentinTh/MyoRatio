class LoaderOverlay {
  #loaderElement;

  constructor() {
    this.#loaderElement = document.getElementById('loader-overlay');
  }

  toggle() {
    this.#loaderElement.classList.toggle('not-visible');
    this.#loaderElement.classList.toggle('overlay-animate');
  }
}

export default new LoaderOverlay();
