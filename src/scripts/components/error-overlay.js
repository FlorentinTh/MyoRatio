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

    if (TypeHelper.isUndefinedOrNull(opts.message) || opts.message === '') {
      this.#message = `Sorry, an error occurred`;
    } else if (!TypeHelper.isString(opts.message)) {
      console.error(
        `message parameter must be of type String. Receive: ${TypeHelper.getType(
          opts.message
        )}`
      );
    }

    if (TypeHelper.isUndefinedOrNull(opts.details) || opts.details === '') {
      this.#details = `unknown`;
    } else if (!TypeHelper.isString(opts.details)) {
      console.error(
        `details parameter must be of type String. Receive: ${TypeHelper.getType(
          opts.details
        )}`
      );
    }

    if (!TypeHelper.isBoolean(opts.interact)) {
      console.error(
        `interact parameter must be of type Boolean. Receive: ${TypeHelper.getType(
          opts.interact
        )}`
      );
    }

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
