import { TypeHelper } from '../helpers/type-helper';

const fs = nw.require('fs');
const HTML2PDF = nw.require('html-pdf-node-generator');

export class PDFReport {
  #PDFOptions = {
    margin: {
      top: '75px',
      bottom: '75px',
      right: '100px',
      left: '100px'
    }
  };

  #PDFPath;

  constructor(sanitizedPath) {
    TypeHelper.checkStringNotNull(sanitizedPath);
    this.#PDFPath = sanitizedPath;
  }

  get getPDFPath() {
    return this.#PDFPath;
  }

  async create() {
    try {
      const PDFBuffer = await HTML2PDF.generatePdf(
        { content: `<h1>This is the PDF report</h1>` },
        this.#PDFOptions
      );

      await fs.promises.writeFile(this.#PDFPath, PDFBuffer);
    } catch (error) {
      throw new Error(error);
    }
  }
}
