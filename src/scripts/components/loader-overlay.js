import '../../styles/components/loader.css';
import loaderTemplate from '../../views/partials/components/loader.hbs';
import { TypeHelper } from '../helpers/type-helper.js';

export class LoaderOverlay {
  #loaderElement;

  constructor() {
    document.querySelector('body').innerHTML += loaderTemplate();
    this.#loaderElement = document.getElementById('loader-overlay');
  }

  toggle(opts = { message: null }) {
    document.querySelector('body').classList.toggle('hide-overflow');

    if (TypeHelper.isUndefinedOrNull(opts.message) || opts.message === '') {
      opts.message = `Loading...`;
    } else if (!TypeHelper.isString(opts.message)) {
      throw new Error(
        `message parameter must be of type String. Received: ${TypeHelper.getType(
          opts.message
        )}`
      );
    }

    document.querySelector('.loading-msg p').innerText = opts.message;

    this.#loaderElement.classList.toggle('not-visible');
    this.#loaderElement.classList.toggle('overlay-animate');
  }
}
