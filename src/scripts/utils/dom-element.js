import { TypeHelper } from '../helpers/type-helper';

export class DOMElement {
  static clear(element, opts = { content: true }) {
    const defaultOpts = { content: true };
    opts = { ...defaultOpts, ...opts };

    if (
      !TypeHelper.isUndefinedOrNull(element) &&
      !TypeHelper.isChildOfHTMLElement(element)
    ) {
      throw new Error(
        `element parameter must be of type NodeList or a child of HTMLElement. Receive: ${TypeHelper.getType(
          element
        )}`
      );
    }

    if (opts.content) {
      while (element.lastElementChild) {
        element.removeChild(element.lastElementChild);
      }
    } else {
      element.remove();
    }
  }
}
