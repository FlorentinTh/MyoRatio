import '../styles/participants-selection.css';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';

const menu = new Menu();
menu.init();

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const changeBtn = document.getElementById('change-btn');
changeBtn.addEventListener('click', () => {
  const dataFolderPathSession = sessionStorage.getItem('data-path');

  if (!(dataFolderPathSession === null)) {
    sessionStorage.removeItem('data-path');
  }

  router.switchPage('data-discovering');
});

let participants = sessionStorage.getItem('participants')?.split(',') || [];
const completedParticipants =
  sessionStorage.getItem('completed-participants')?.split(',') || [];

function toggleSubmitBtn() {
  if (participants.length > 0) {
    if (submitBtn.disabled) {
      submitBtn.removeAttribute('disabled');
    }
  } else {
    if (!submitBtn.disabled) {
      submitBtn.setAttribute('disabled', '');
    }
  }
}

function toggleParticipantStorage() {
  if (participants.length > 0) {
    sessionStorage.setItem('participants', participants.join(','));
  } else {
    sessionStorage.removeItem('participants');
  }
}

function toggleCompletedParticipantStorage() {
  if (completedParticipants.length > 0) {
    sessionStorage.setItem('completed-participants', completedParticipants.join(','));
  } else {
    sessionStorage.removeItem('completed-participants');
  }
}

const previewBtn = document.getElementById('btn-preview');
const selectBtnAll = document.getElementById('btn-all');
const selectBtnNotCompleted = document.getElementById('btn-not-completed');
const submitBtn = document.querySelector('button[type="submit"]');
const dataPath = document.getElementById('data-path');

const participantList = document.querySelector('ul.list').children;

let isAllSelected = false;
let isAllNotCompletedSelected = false;

dataPath.innerText += ` ${sessionStorage.getItem('data-path') || 'ERROR'}`;
toggleSubmitBtn();

if (!(sessionStorage.getItem('results-available') === null)) {
  for (const participantItem of participantList) {
    const participantName = participantItem.querySelector('.line-1').innerHTML;

    if (participants.length > 0 && participants.includes(participantName)) {
      if (participantItem.classList.contains('not-completed')) {
        participantItem.classList.remove('not-completed');
        participantItem.classList.add('completed');

        const participantIcon = participantItem.querySelector('.content i');
        participantIcon.classList.remove('fa-user-times');
        participantIcon.classList.add('fa-user-check');

        participantItem.querySelector('.line-2').innerText = 'completed';
        participantItem.querySelector('.actions button').removeAttribute('disabled');
      }

      if (!completedParticipants.includes(participantName)) {
        completedParticipants.push(participantName);
      }

      participants.pop();
    }
  }

  toggleParticipantStorage();
  toggleCompletedParticipantStorage();
  toggleSubmitBtn();
} else {
  if (participants.length > 0 && participantList.length === participants.length) {
    selectBtnAll.innerHTML = 'Unselect All';
    isAllSelected = true;
  }
}

if (!(sessionStorage.getItem('completed-participants') === null)) {
  for (const participantItem of participantList) {
    const participantName = participantItem.querySelector('.line-1').innerHTML;

    if (
      completedParticipants.length > 0 &&
      completedParticipants.includes(participantName) &&
      participantItem.classList.contains('not-completed')
    ) {
      participantItem.classList.remove('not-completed');
      participantItem.classList.add('completed');

      const participantIcon = participantItem.querySelector('.content i');
      participantIcon.classList.remove('fa-user-times');
      participantIcon.classList.add('fa-user-check');

      participantItem.querySelector('.line-2').innerText = 'completed';
      participantItem.querySelector('.actions button').removeAttribute('disabled');
    }
  }
}

for (const participantItem of participantList) {
  const participantName = participantItem.querySelector('.line-1').innerHTML;

  if (sessionStorage.getItem('results-available') === null) {
    if (
      participants.length > 0 &&
      !participantItem.classList.contains('selected') &&
      participants.includes(participantName)
    ) {
      participantItem.classList.toggle('selected');
      toggleSubmitBtn();
    }
  }

  participantItem.querySelector('.content').addEventListener('click', () => {
    if (participantItem.classList.contains('selected')) {
      participants = participants.filter(participant => participant !== participantName);
    } else {
      participants.push(participantName);
    }

    participantItem.classList.toggle('selected');
    toggleSubmitBtn();
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

previewBtn.addEventListener('click', () => {
  if (!previewBtn.disabled) {
    loaderOverlay.toggle({ message: 'Preparing data...' });

    setTimeout(() => {
      router.switchPage('angles-preview');
    }, 2000);
  }
});

selectBtnAll.addEventListener('click', () => {
  if (!isAllSelected) {
    for (const participantItem of participantList) {
      if (!participantItem.classList.contains('selected')) {
        const participantName = participantItem.querySelector('.line-1').innerHTML;
        participants.push(participantName);
        participantItem.classList.toggle('selected');
      }
    }

    selectBtnAll.innerHTML = 'Unselect All';
    isAllSelected = true;
    selectBtnNotCompleted.setAttribute('disabled', '');
  } else {
    for (const participantItem of participantList) {
      participantItem.classList.toggle('selected');
      participants.pop();
    }

    selectBtnAll.innerHTML = 'All';
    isAllSelected = false;
    selectBtnNotCompleted.removeAttribute('disabled');
  }

  toggleSubmitBtn();
  toggleParticipantStorage();
});

selectBtnNotCompleted.addEventListener('click', () => {
  if (!isAllNotCompletedSelected) {
    for (const participantItem of participantList) {
      const participantItemClasses = participantItem.classList;
      if (
        participantItemClasses.contains('not-completed') &&
        !participantItemClasses.contains('selected')
      ) {
        const participantName = participantItem.querySelector('.line-1').innerHTML;
        participants.push(participantName);
        participantItem.classList.toggle('selected');
      }
    }

    selectBtnNotCompleted.innerHTML = 'Unselect Not Completed';
    isAllNotCompletedSelected = true;
    selectBtnAll.setAttribute('disabled', '');
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

    selectBtnNotCompleted.innerHTML = 'Not Completed';
    isAllNotCompletedSelected = false;
    selectBtnAll.removeAttribute('disabled');
  }

  toggleSubmitBtn();
  toggleParticipantStorage();
});

submitBtn.addEventListener('click', () => {
  if (!submitBtn.disabled) {
    loaderOverlay.toggle({ message: 'Preparing data...' });

    setTimeout(() => {
      router.switchPage('angles-selection');
    }, 2000);
  }
});
