import '../../styles/components/loader.css';
import loaderTemplate from '../../views/partials/components/loader.hbs';

export class LoaderOverlay {
  #loaderElement;

  constructor() {
    this.#loaderElement = document.getElementById('loader-overlay');
    this.#loaderElement.innerHTML = loaderTemplate();
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
