import '../../styles/components/loader.css';
import loaderTemplate from '../../views/partials/components/loader.hbs';

export class LoaderOverlay {
  #loaderElement;

  constructor() {
    document.querySelector('body').innerHTML += loaderTemplate();
    this.#loaderElement = document.getElementById('loader-overlay');
  }

  toggle(opts = { message: null }) {
    document.querySelector('body').classList.toggle('hide-overflow');

    if (opts.message === '' || opts.message === null) {
      opts.message = `Loading...`;
    }

    document.querySelector('.loading-msg p').innerText = opts.message;

    this.#loaderElement.classList.toggle('not-visible');
    this.#loaderElement.classList.toggle('overlay-animate');
  }
}
