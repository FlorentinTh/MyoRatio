import footer from '../../views/partials/pdf-report/footer.hbs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { TypeHelper } from '../helpers/type-helper';

const fs = nw.require('fs');
const HTML2PDF = nw.require('html-pdf-node-generator');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Toronto');

export class PDFReport {
  #currentDateTime;
  #PDFPath;
  #PDFOptions = {
    margin: {
      top: '75px',
      bottom: '85px',
      right: '100px',
      left: '100px'
    },
    // printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<style>display: none!important;</style>'
  };

  constructor(sanitizedPath) {
    TypeHelper.checkStringNotNull(sanitizedPath);
    this.#currentDateTime = dayjs().format('YYYY-MM-DD hh:mm');
    this.#PDFPath = sanitizedPath;
  }

  get getPDFPath() {
    return this.#PDFPath;
  }

  async create(data) {
    TypeHelper.checkStringNotNull(data);

    try {
      const PDFBuffer = await HTML2PDF.generatePdf(
        { content: data },
        {
          ...this.#PDFOptions,
          ...{
            footerTemplate: footer({
              dateTime: this.#currentDateTime
            })
          }
        }
      );

      await fs.promises.writeFile(this.#PDFPath, PDFBuffer);
    } catch (error) {
      throw new Error(error);
    }
  }
}
