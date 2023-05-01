const { createServer } = nw.require('net');

export class NetHelper {
  static async #isPortBusy(port) {
    return new Promise((resolve, reject) => {
      const server = createServer();
      server.once('error', err => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          reject(err);
        }
      });
      server.once('listening', () => {
        server.close();
        resolve(false);
      });
      server.listen(port, '127.0.0.1');
    });
  }

  static async findNextAvailablePort(port) {
    if (port >= 3300 && port < 3400) {
      const isPortBusy = await NetHelper.#isPortBusy(port);

      if (!isPortBusy) {
        return port;
      } else {
        return NetHelper.findNextAvailablePort((port += 1));
      }
    } else {
      throw new Error('Port value must be between 3300 and 3399');
    }
  }
}
