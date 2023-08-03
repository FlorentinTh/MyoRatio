import { Metadata } from '../app/metadata';
import { PathHelper } from './path-helper';
import { StringHelper } from './string-helper';

const fs = nw.require('fs');
const path = nw.require('path');

export class MutexHelper {
  static async unlock(participant) {
    if (!('data-path' in sessionStorage)) {
      throw new Error('Impossible to retrieve data path');
    }

    if (!('analysis' in sessionStorage)) {
      throw new Error('Impossible to retrieve data analysis');
    }

    if (!('locked-participant' in sessionStorage)) {
      throw new Error('Impossible to retrieve locked-participant');
    }

    const dataPath = PathHelper.sanitizePath(
      sessionStorage.getItem('data-path').toString().trim()
    );
    const analysisType = PathHelper.sanitizePath(
      sessionStorage.getItem('analysis').toString().toLowerCase().trim()
    );

    const metadata = new Metadata(dataPath);

    const participantMetadataPath = await metadata.getParticipantFolderPath(
      analysisType,
      participant,
      { fromSession: true }
    );

    const participantLabel = StringHelper.revertParticipantNameFromSession(participant);
    const metadataRootPath = path.parse(participantMetadataPath).dir;

    try {
      await fs.promises.access(
        path.join(metadataRootPath, `${participantLabel}.lock`),
        fs.constants.F_OK
      );

      await fs.promises.unlink(
        PathHelper.sanitizePath(path.join(metadataRootPath, `${participantLabel}.lock`))
      );
    } catch (error) {
      throw new Error(error);
    }

    sessionStorage.removeItem('locked-participant');
  }
}
