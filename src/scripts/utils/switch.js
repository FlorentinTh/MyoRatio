import { PathHelper } from '../helpers/path-helper';
import { TypeHelper } from '../helpers/type-helper';

export class Switch {
  static init(label, opts = { disabled: false }) {
    TypeHelper.checkStringNotNull(label, { label: 'label' });

    const defaultOpts = { disabled: false };
    opts = { ...defaultOpts, ...opts };

    TypeHelper.checkBoolean(opts.disabled, { label: 'disabled' });

    let storedSwitchValue = sessionStorage.getItem(label);

    let switchRadios = [...document.getElementById(`switch-${label}`).children];
    switchRadios = switchRadios.filter(item => item.nodeName === 'INPUT');

    if (storedSwitchValue === null) {
      sessionStorage.setItem(label, switchRadios[0].value);
      switchRadios[0].checked = true;
    } else {
      storedSwitchValue = PathHelper.sanitizePath(
        storedSwitchValue.toString().toLowerCase().trim()
      );

      for (const switchRadio of switchRadios) {
        if (switchRadio.value === storedSwitchValue) {
          switchRadio.checked = true;
        }
      }
    }

    for (const switchRadio of switchRadios) {
      if (!opts.disabled) {
        switchRadio.addEventListener('change', event => {
          sessionStorage.setItem(label, switchRadio.value);
        });
      } else {
        switchRadio.setAttribute('disabled', '');
      }
    }

    return switchRadios;
  }
}
