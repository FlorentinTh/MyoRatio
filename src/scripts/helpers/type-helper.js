const checkLabelParameter = label => {
  if (TypeHelper.isUndefinedOrNull(label)) {
    throw new Error(`label parameter cannot be ${label}`);
  } else if (!TypeHelper.isString(label)) {
    throw new Error(
      `label parameter must be of type String. Received: ${TypeHelper.getType(label)}`
    );
  }
};

export class TypeHelper {
  static getType(data) {
    return Object.prototype.toString.call(data);
  }

  static isString(str) {
    return Object.prototype.toString.call(str) === '[object String]';
  }

  static isInt(int) {
    return (
      Object.prototype.toString.call(int) === '[object Number]' &&
      Number.isSafeInteger(int)
    );
  }

  static checkStringNotNull(str, opts = { label: '' }) {
    checkLabelParameter(opts.label);

    const defaultOpts = { label: '' };
    opts = { ...defaultOpts, ...opts };

    if (TypeHelper.isUndefinedOrNull(str)) {
      throw new Error(`${opts.label} parameter cannot be ${str}`);
    } else if (str === '') {
      throw new Error(`${opts.label} parameter cannot be an empty String`);
    } else if (!TypeHelper.isString(str)) {
      throw new Error(
        `${opts.label} parameter must be of type String. Received: ${TypeHelper.getType(
          str
        )}`
      );
    }
  }

  static checkString(str, opts = { label: '' }) {
    checkLabelParameter(opts.label);

    const defaultOpts = { label: '' };
    opts = { ...defaultOpts, ...opts };

    if (TypeHelper.isUndefinedOrNull(str)) {
      throw new Error(`${opts.label} parameter cannot be ${str}`);
    } else if (!TypeHelper.isString(str)) {
      throw new Error(
        `${opts.label} parameter must be of type String. Received: ${TypeHelper.getType(
          str
        )}`
      );
    }
  }

  static checkInt(int, opts = { label: '' }) {
    checkLabelParameter(opts.label);

    const defaultOpts = { label: '' };
    opts = { ...defaultOpts, ...opts };

    if (TypeHelper.isUndefinedOrNull(int)) {
      throw new Error(`${opts.label} parameter cannot be ${int}`);
    } else if (!TypeHelper.isInt(int)) {
      throw new Error(
        `${opts.label} parameter must be of type Int. Received: ${TypeHelper.getType(
          int
        )}`
      );
    }
  }

  static isBoolean(bool) {
    return Object.prototype.toString.call(bool) === '[object Boolean]';
  }

  static checkBoolean(bool, opts = { label: '' }) {
    checkLabelParameter(opts.label);

    const defaultOpts = { label: '' };
    opts = { ...defaultOpts, ...opts };

    if (TypeHelper.isUndefinedOrNull(bool)) {
      throw new Error(`${opts.label} parameter cannot be ${bool}`);
    } else if (!TypeHelper.isBoolean(bool)) {
      throw new Error(
        `${opts.label} parameter must be of type String. Received: ${TypeHelper.getType(
          bool
        )}`
      );
    }
  }

  static isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
  }

  static checkArray(arr, opts = { label: '' }) {
    checkLabelParameter(opts.label);

    const defaultOpts = { label: '' };
    opts = { ...defaultOpts, ...opts };

    if (TypeHelper.isUndefinedOrNull(arr)) {
      throw new Error(`${opts.label} parameter cannot be ${arr}`);
    } else if (!TypeHelper.isArray(arr)) {
      throw new Error(
        `${opts.label} parameter must be of type String. Received: ${TypeHelper.getType(
          arr
        )}`
      );
    }
  }

  static isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  static checkObject(obj, opts = { label: '' }) {
    checkLabelParameter(opts.label);

    const defaultOpts = { label: '' };
    opts = { ...defaultOpts, ...opts };

    if (TypeHelper.isUndefinedOrNull(obj)) {
      throw new Error(`${opts.label} parameter cannot be ${obj}`);
    } else if (!TypeHelper.isObject(obj)) {
      throw new Error(
        `${opts.label} parameter must be of type String. Received: ${TypeHelper.getType(
          obj
        )}`
      );
    }
  }

  static isUndefinedOrNull(val) {
    return val === null || val === undefined;
  }

  static isChildOfHTMLElement(elem) {
    return Object.prototype.isPrototypeOf.call(HTMLElement.prototype, elem);
  }

  static isNodeList(nodeList) {
    return Object.prototype.toString.call(nodeList) === '[object NodeList]';
  }
}
