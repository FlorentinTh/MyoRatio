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

    let participantIndicator;

    if (participantArray.length > 2) {
      participantIndicator = participantArray[participantArray.length - 1];
    }

    return participantIndicator === undefined
      ? `${participantID}`
      : `${participantID} (${participantIndicator.toUpperCase()})`;
  }

  static capitalize(str) {
    TypeHelper.checkStringNotNull(str, { label: 'str' });
    const array = str.split(/[-_ ]/);
    const separators = str.match(/[-_ ]/g) || [];

    const capitalizedArray = array.map(
      item => item.charAt(0).toUpperCase() + item.slice(1)
    );

    return capitalizedArray.reduce((acc, part, index) => {
      return acc + part + (separators[index] || '');
    }, '');
  }
}
