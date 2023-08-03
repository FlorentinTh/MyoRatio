import { TypeHelper } from '../helpers/type-helper.js';

export class ObjectHelper {
  static deepCompare(a, b, visited = new WeakMap()) {
    TypeHelper.checkObject(a, { label: 'Object a' });
    TypeHelper.checkObject(b, { label: 'Object b' });

    if (a === b) {
      return true;
    }

    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }

    visited.set(a, true);
    visited.set(b, true);

    for (const key of Object.keys(a)) {
      if (!(key in b)) {
        return false;
      }

      if (typeof a[key] === 'object' && typeof b[key] === 'object') {
        if (!ObjectHelper.deepCompare(a[key], b[key], visited)) {
          return false;
        }
      } else if (!(a[key] === b[key])) {
        return false;
      }
    }

    return true;
  }
}
