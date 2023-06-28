import '../../styles/components/loader.css';
import loaderTemplate from '../../views/partials/components/loader.hbs';
import { TypeHelper } from '../helpers/type-helper.js';

export class Loader {
  #loaderElement;
  #loaderMessage;

  constructor() {
    document.querySelector('body').insertAdjacentHTML('afterbegin', loaderTemplate());
    this.#loaderElement = document.getElementById('loader-overlay');
    this.#loaderMessage = document.querySelector('.loading-msg p');
  }

  get loaderMessage() {
    return this.#loaderMessage;
  }

  toggle(opts = { message: '' }) {
    const defaultOpts = { message: '' };
    opts = { ...defaultOpts, ...opts };

    document.querySelector('body').classList.toggle('hide-overflow');

    TypeHelper.checkString(opts.message, { label: 'message' });

    this.#loaderMessage.innerText = opts.message;
    this.#loaderElement.classList.toggle('not-visible');
    this.#loaderElement.classList.toggle('overlay-animate');
  }
}
