import '../../styles/components/error.css';
import errorTemplate from '../../views/partials/components/error.hbs';
import { TypeHelper } from '../helpers/type-helper.js';

export class ErrorOverlay {
  #message;
  #details;

  constructor(opts = { message: null, details: null }) {
    if (TypeHelper.isUndefinedOrNull(opts.message) || opts.message === '') {
      this.#message = `Sorry, an error occurred`;
    } else if (!TypeHelper.isString(opts.message)) {
      throw new Error(
        `message parameter must be of type String. Receive: ${TypeHelper.getType(
          opts.message
        )}`
      );
    }

    if (TypeHelper.isUndefinedOrNull(opts.details) || opts.details === '') {
      this.#details = `unknown`;
    } else if (!TypeHelper.isString(opts.details)) {
      throw new Error(
        `details parameter must be of type String. Receive: ${TypeHelper.getType(
          opts.details
        )}`
      );
    }

    this.#message = opts.message;
    this.#details = opts.details;
  }

  show() {
    const body = document.querySelector('body');

    body.innerHTML += errorTemplate({
      message: this.#message,
      details: this.#details
    });

    if (!body.classList.contains('hide-overflow')) {
      body.classList.add('hide-overflow');
    }
  }
}
