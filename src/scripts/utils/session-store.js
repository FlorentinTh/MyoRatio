import { TypeHelper } from '../helpers/type-helper';

export class SessionStore {
  static clear(opts = { keep: [] }) {
    const defaultOpts = { keep: [] };
    opts = { ...defaultOpts, ...opts };

    TypeHelper.checkArray(opts.keep, { label: 'keep' });

    for (const key in sessionStorage) {
      if (!opts.keep.includes(key)) {
        sessionStorage.removeItem(key);
      }
    }
  }
}
