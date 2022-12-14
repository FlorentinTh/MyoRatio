export class TypeHelper {
  static isString(str) {
    return Object.prototype.toString.call(str) === '[object String]';
  }

  static isBoolean(bool) {
    return Object.prototype.toString.call(bool) === '[object Boolean]';
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

  static isChildOfHTMLElement(elem) {
    return Object.prototype.isPrototypeOf.call(HTMLElement.prototype, elem);
  }

  static isNodeList(nodeList) {
    return Object.prototype.toString.call(nodeList) === '[object NodeList]';
  }

  static getType(data) {
    return Object.prototype.toString.call(data);
  }
}
