import { ErrorOverlay } from './error-overlay';
import { TypeHelper } from '../helpers/type-helper';

const path = nw.require('path');
const fs = nw.require('fs');

export const getAllParticipants = async sanitizedPath => {
  TypeHelper.checkStringNotNull(sanitizedPath);

  let participantsFolder;
  try {
    let filteredParticipants;

    try {
      participantsFolder = await fs.promises.readdir(sanitizedPath);

      filteredParticipants = participantsFolder = participantsFolder.filter(
        async file => {
          const stat = await fs.promises.stat(path.join(sanitizedPath, file));
          return stat.isDirectory();
        }
      );
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Error occurs while trying to retrieve participants`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }

    return filteredParticipants;
  } catch (error) {
    throw new Error(error);
  }
};
