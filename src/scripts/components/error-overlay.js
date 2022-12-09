import '../../styles/components/error.css';
import errorTemplate from '../../views/partials/components/error.hbs';

export class ErrorOverlay {
  #errorElement;
  #message;
  #details;

  constructor(opts = { message: null, details: null }) {
    if (opts.message === null || opts.message === '') {
      this.#message = `Sorry, an error occurred`;
    }

    if (opts.details === null || opts.details === '') {
      this.#details = `unknown`;
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
