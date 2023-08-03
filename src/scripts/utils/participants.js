import { TypeHelper } from '../helpers/type-helper';

const path = nw.require('path');
const fs = nw.require('fs');

export const getAllParticipants = async (sanitizedPath, isPreview = false) => {
  TypeHelper.checkStringNotNull(sanitizedPath, { label: 'sanitizedPath' });

  let participantsFolder;
  try {
    let filteredParticipants;

    try {
      participantsFolder = await fs.promises.readdir(sanitizedPath);

      filteredParticipants = participantsFolder.filter(file => {
        const stat = fs.statSync(path.join(sanitizedPath, file));
        return stat.isDirectory();
      });
    } catch (error) {
      throw new Error(error);
    }

    if (isPreview) {
      return filteredParticipants.sort((a, b) => {
        return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
      });
    }

    return filteredParticipants.sort((a, b) => {
      return b.localeCompare(a, undefined, { sensitivity: 'base', numeric: true });
    });
  } catch (error) {
    throw new Error(error);
  }
};
