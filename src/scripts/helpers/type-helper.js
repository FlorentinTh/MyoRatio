export class TypeHelper {
  static isString(str) {
    return Object.prototype.toString.call(str) === '[object String]';
  }

  static isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
  }

  static isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  static isUndefinedOrNull(val) {
    return val === null || val === undefined;
  }

  static getType(data) {
    return Object.prototype.toString.call(data);
  }
}
