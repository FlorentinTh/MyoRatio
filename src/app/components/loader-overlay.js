class LoaderOverlay {
  #loaderElement;

  constructor() {
    this.#loaderElement = document.getElementById('loader-overlay');
  }

  toggle(message = '') {
    document.querySelector('body').classList.toggle('hide-overflow');

    if (!(message === '')) {
      document.querySelector('.loading-msg p').innerText = message;
    }

    this.#loaderElement.classList.toggle('not-visible');
    this.#loaderElement.classList.toggle('overlay-animate');
  }
}

export default new LoaderOverlay();
