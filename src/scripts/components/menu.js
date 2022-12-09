import '../../styles/components/menu.css';
import menuTemplate from '../../views/partials/components/menu.hbs';

// eslint-disable-next-line no-undef
const path = nw.require('path');
// eslint-disable-next-line no-undef
const exec = nw.require('child_process').execFile;

export class Menu {
  #toggleNavBtn;
  #additionalBtns;

  constructor() {
    const menuContainer = document.querySelector('.menu-container');
    menuContainer.innerHTML = menuTemplate();

    this.#toggleNavBtn = document.querySelector('.toggle-nav-btn');
    this.#additionalBtns = null;
  }

  init(buttons = []) {
    this.#toggleNavBtn.addEventListener('click', () => {
      this.#toggle();
    });

    this.#additionalBtns = buttons;
    this.#setHPFConverterItem();
  }

  #toggle() {
    document.querySelector('body').classList.toggle('nav-open');
    document.querySelector('nav').classList.toggle('open');
    document.querySelector('.content').classList.toggle('open');

    if (this.#additionalBtns.length > 0) {
      for (const btn of this.#additionalBtns) {
        btn.classList.toggle('open');
      }
    }

    this.#toggleNavBtn.classList.toggle('open');
  }

  #setHPFConverterItem() {
    const basePath = process.env.INIT_CWD ?? process.cwd();
    const delsysExecutablePath = path.join(basePath, 'bin', 'DelsysFileUtil.exe');

    document.getElementById('hpf-converter').addEventListener('click', () => {
      this.#toggle();

      exec(delsysExecutablePath, (err, data) => {
        if (err) {
          console.error(err);
        }

        if (data) {
          console.log(data);
        }
      });
    });
  }
}
