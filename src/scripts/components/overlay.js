import '../../styles/components/success-error.css';

import successTemplate from '../../views/partials/components/success.hbs';
import errorTemplate from '../../views/partials/components/error.hbs';

import { TypeHelper } from '../helpers/type-helper.js';
import { Router } from '../routes/router';

const OverlayType = {
  ERROR: 'error',
  SUCCESS: 'success'
};

class Overlay {
  #message;
  #details;
  #interact;
  #type;
  #redirect;

  constructor(
    type,
    opts = { message: null, details: null, interact: false, redirect: null }
  ) {
    const defaultOpts = { message: null, details: null, interact: false, redirect: '' };
    opts = { ...defaultOpts, ...opts };

    TypeHelper.checkStringNotNull(opts.message, { label: 'message' });
    TypeHelper.checkStringNotNull(opts.details, { label: 'details' });
    TypeHelper.checkBoolean(opts.interact, { label: 'interact' });
    TypeHelper.checkString(opts.redirect, { label: 'redirect' });

    this.#message = opts.message;
    this.#details = opts.details;
    this.#interact = opts.interact;
    this.#type = type;
    this.#redirect = opts.redirect;
  }

  show() {
    const body = document.querySelector('body');
    let template;

    if (this.#type === OverlayType.ERROR) {
      template = errorTemplate({
        message: this.#message,
        details: this.#details,
        interact: this.#interact
      });
    } else if (this.#type === OverlayType.SUCCESS) {
      template = successTemplate({
        message: this.#message,
        details: this.#details,
        interact: this.#interact
      });
    }

    body.insertAdjacentHTML('afterbegin', template);

    if (!body.classList.contains('hide-overflow')) {
      body.classList.add('hide-overflow');
    }

    if (this.#interact) {
      const interactButton = document.getElementById('interact-btn');

      interactButton.addEventListener('click', () => {
        let overlay;

        if (this.#type === OverlayType.ERROR) {
          overlay = document.getElementById('error-overlay');
        } else if (this.#type === OverlayType.SUCCESS) {
          overlay = document.getElementById('success-overlay');
        }

        if (this.#redirect === '') {
          overlay.remove();
          body.classList.remove('hide-overflow');
        } else {
          const router = new Router();
          router.disableBackButton();
          router.switchPage(this.#redirect);
        }
      });
    }
  }
}

export class ErrorOverlay extends Overlay {
  constructor(opts = { message: null, details: null, interact: false, redirect: '' }) {
    super(OverlayType.ERROR, opts);
  }
}

export class SuccessOverlay extends Overlay {
  constructor(opts = { message: null, details: null, interact: false, redirect: '' }) {
    super(OverlayType.SUCCESS, opts);
  }
}
