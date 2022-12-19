import { TypeHelper } from '../helpers/type-helper.js';

export class StringHelper {
  static formatParticipantName(participant) {
    TypeHelper.checkStringNotNull(participant, { label: 'participant' });

    return `participant_${participant
      .replace(')', '')
      .replace('(', '')
      .replace(/ /g, '_')}`.toLocaleLowerCase();
  }
}
