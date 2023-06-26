import { TypeHelper } from './type-helper';

export class LinkHelper {
  static openExternalLinks(selector = 'a[target=_blank]') {
    TypeHelper.checkStringNotNull(selector, { label: 'selector' });

    const links = document.querySelectorAll(selector);

    for (const link of links) {
      link.addEventListener('click', event => {
        event.preventDefault();
        nw.Shell.openExternal(link.href);
        return false;
      });
    }
  }
}
