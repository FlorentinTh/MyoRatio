import { TypeHelper } from '../helpers/type-helper.js';

export class StringHelper {
  static formatParticipantName(participant) {
    TypeHelper.checkStringNotNull(participant, { label: 'participant' });

    return `participant_${participant
      .replace(')', '')
      .replace('(', '')
      .replace(/ /g, '_')}`.toLocaleLowerCase();
  }

  static revertParticipantNameFromSession(participant) {
    const participantArray = participant.split('_');
    const participantID = participantArray.slice(1, participantArray.length - 1);
    const participantSex = participantArray[participantArray.length - 1];
    return `${participantID} (${participantSex.toUpperCase()})`;
  }
}
