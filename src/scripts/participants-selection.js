import '../styles/participants-selection.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();

const additionalMenuButtons = document.querySelectorAll('[class^="export-"]');
menu.init(additionalMenuButtons);

const changeButton = document.getElementById('change-btn');

changeButton.addEventListener('click', () => {
  const dataFolderPathSession = sessionStorage.getItem('data-path');

  if (!(dataFolderPathSession === null)) {
    sessionStorage.removeItem('data-path');
  }

  router.switchPage('data-discovering');
});

let participants = sessionStorage.getItem('participants')?.split(',') || [];
const completedParticipants =
  sessionStorage.getItem('completed-participants')?.split(',') || [];

const previewButton = document.getElementById('btn-preview');
const selectButtonAll = document.getElementById('btn-all');
const selectButtonNotCompleted = document.getElementById('btn-not-completed');
const submitButton = document.querySelector('button[type="submit"]');
const dataPath = document.getElementById('data-path');
const participantList = document.querySelector('ul.list').children;

let isAllSelected = false;
let isAllNotCompletedSelected = false;

dataPath.innerText += ` ${sessionStorage.getItem('data-path') || 'ERROR'}`;

const toggleSubmitButton = () => {
  if (participants.length > 0) {
    if (submitButton.disabled) {
      submitButton.removeAttribute('disabled');
    }
  } else {
    if (!submitButton.disabled) {
      submitButton.setAttribute('disabled', '');
    }
  }
};

toggleSubmitButton();

const toggleParticipantStorage = () => {
  if (participants.length > 0) {
    sessionStorage.setItem('participants', participants.join(','));
  } else {
    sessionStorage.removeItem('participants');
  }
};

const toggleCompletedParticipantStorage = () => {
  if (completedParticipants.length > 0) {
    sessionStorage.setItem('completed-participants', completedParticipants.join(','));
  } else {
    sessionStorage.removeItem('completed-participants');
  }
};

const setParticipantItemCompleted = participantItem => {
  participantItem.classList.remove('not-completed');
  participantItem.classList.add('completed');

  const participantIcon = participantItem.querySelector('.content i');
  participantIcon.classList.remove('fa-user-times');
  participantIcon.classList.add('fa-user-check');

  participantItem.querySelector('.line-2').innerText = 'completed';
  participantItem.querySelector('.actions button').removeAttribute('disabled');
};

if (!(sessionStorage.getItem('results-available') === null)) {
  for (const participantItem of participantList) {
    const participantName = participantItem.querySelector('.line-1').innerText;

    if (participants.length > 0 && participants.includes(participantName)) {
      if (participantItem.classList.contains('not-completed')) {
        setParticipantItemCompleted(participantItem);
      }

      if (!completedParticipants.includes(participantName)) {
        completedParticipants.push(participantName);
      }

      participants.pop();
    }
  }

  toggleParticipantStorage();
  toggleCompletedParticipantStorage();
  toggleSubmitButton();
} else {
  if (participants.length > 0 && participantList.length === participants.length) {
    selectButtonAll.innerText = 'Unselect All';
    isAllSelected = true;
  }
}

if (!(sessionStorage.getItem('completed-participants') === null)) {
  for (const participantItem of participantList) {
    const participantName = participantItem.querySelector('.line-1').innerText;

    if (
      completedParticipants.length > 0 &&
      completedParticipants.includes(participantName) &&
      participantItem.classList.contains('not-completed')
    ) {
      setParticipantItemCompleted(participantItem);
    }
  }
}

for (const participantItem of participantList) {
  const participantName = participantItem.querySelector('.line-1').innerText;

  if (sessionStorage.getItem('results-available') === null) {
    if (
      participants.length > 0 &&
      !participantItem.classList.contains('selected') &&
      participants.includes(participantName)
    ) {
      participantItem.classList.toggle('selected');
      toggleSubmitButton();
    }
  }

  participantItem.querySelector('.content').addEventListener('click', () => {
    if (participantItem.classList.contains('selected')) {
      participants = participants.filter(participant => participant !== participantName);
    } else {
      participants.push(participantName);
    }

    participantItem.classList.toggle('selected');
    toggleSubmitButton();
    toggleParticipantStorage();
  });

  participantItem.querySelector('.actions > button').addEventListener('click', () => {
    loaderOverlay.toggle({ message: 'Preparing results...' });

    sessionStorage.setItem('participant-result', participantName);

    setTimeout(() => {
      router.switchPage('results');
    }, 1000);
  });
}

previewButton.addEventListener('click', () => {
  if (!previewButton.disabled) {
    loaderOverlay.toggle({ message: 'Preparing data...' });

    setTimeout(() => {
      router.switchPage('angles-preview');
    }, 2000);
  }
});

const selectParticipant = participantItem => {
  const participantName = participantItem.querySelector('.line-1').innerText;
  participants.push(participantName);
  participantItem.classList.toggle('selected');
};

const toggleSelectButtons = (selected, all = true) => {
  if (all) {
    const baseText = 'All';
    selectButtonAll.innerText = selected ? `Unselect ${baseText}` : baseText;
    isAllSelected = selected;
  } else {
    const baseText = 'Not Completed';
    selectButtonNotCompleted.innerText = selected ? `Unselect ${baseText}` : baseText;
    isAllNotCompletedSelected = selected;
  }

  if (selected) {
    if (all) {
      selectButtonNotCompleted.setAttribute('disabled', '');
    } else {
      selectButtonAll.setAttribute('disabled', '');
    }
  } else {
    if (all) {
      selectButtonNotCompleted.removeAttribute('disabled');
    } else {
      selectButtonAll.removeAttribute('disabled');
    }
  }
};

selectButtonAll.addEventListener('click', () => {
  if (!isAllSelected) {
    for (const participantItem of participantList) {
      if (!participantItem.classList.contains('selected')) {
        selectParticipant(participantItem);
      }
    }

    toggleSelectButtons(true);
  } else {
    for (const participantItem of participantList) {
      participantItem.classList.toggle('selected');
      participants.pop();
    }

    toggleSelectButtons(false);
  }

  toggleSubmitButton();
  toggleParticipantStorage();
});

selectButtonNotCompleted.addEventListener('click', () => {
  if (!isAllNotCompletedSelected) {
    for (const participantItem of participantList) {
      const participantItemClasses = participantItem.classList;
      if (
        participantItemClasses.contains('not-completed') &&
        !participantItemClasses.contains('selected')
      ) {
        selectParticipant(participantItem);
      }
    }

    toggleSelectButtons(true, false);
  } else {
    for (const participantItem of participantList) {
      const participantItemClasses = participantItem.classList;

      if (
        participantItemClasses.contains('not-completed') &&
        participantItemClasses.contains('selected')
      ) {
        participantItem.classList.toggle('selected');
        participants.pop();
      }
    }

    toggleSelectButtons(false, false);
  }

  toggleSubmitButton();
  toggleParticipantStorage();
});

submitButton.addEventListener('click', () => {
  if (!submitButton.disabled) {
    loaderOverlay.toggle({ message: 'Preparing data...' });

    setTimeout(() => {
      router.switchPage('angles-selection');
    }, 2000);
  }
});
