import '../../styles/components/error.css';
import errorTemplate from '../../views/partials/components/error.hbs';
import { TypeHelper } from '../helpers/type-helper.js';

export class ErrorOverlay {
  #message;
  #details;
  #interact;

  constructor(opts = { message: null, details: null, interact: false }) {
    const defaultOpts = { message: null, details: null, interact: false };
    opts = { ...defaultOpts, ...opts };

    TypeHelper.checkStringNotNull(opts.message, { label: 'message' });
    TypeHelper.checkStringNotNull(opts.details, { label: 'details' });
    TypeHelper.checkBoolean(opts.interact, { label: 'interact' });

    this.#message = opts.message;
    this.#details = opts.details;
    this.#interact = opts.interact;
  }

  show() {
    const body = document.querySelector('body');

    body.insertAdjacentHTML(
      'afterbegin',
      errorTemplate({
        message: this.#message,
        details: this.#details,
        interact: this.#interact
      })
    );

    if (!body.classList.contains('hide-overflow')) {
      body.classList.add('hide-overflow');
    }

    if (this.#interact) {
      const interactButton = document.getElementById('interact-btn');
      interactButton.addEventListener('click', () => {
        document.getElementById('error-overlay').remove();
        body.classList.remove('hide-overflow');
      });
    }
  }
}
