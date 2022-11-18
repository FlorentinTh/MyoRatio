import LoaderOverlay from './components/loader-overlay.js';
import Menu from './components/menu.js';
import Router from './utils/router.js';

const menu = new Menu();
menu.init();

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

const selectBtnAll = document.getElementById('btn-all');
const selectBtnNotCompleted = document.getElementById('btn-not-completed');
const submitBtn = document.querySelector('button[type="submit"]');
const dataPath = document.getElementById('data-path');

const participantList = document.querySelector('ul.list').children;

let isAllSelected = false;
let isAllNotCompletedSelected = false;

dataPath.innerHTML += ` ${sessionStorage.getItem('data-path') || 'ERROR'}`;
toggleSubmitBtn();

if (!(sessionStorage.getItem('results-available') === null)) {
  for (const participantItem of participantList) {
    const participantName = participantItem.querySelector('.line-1').innerHTML;

    if (
      participants.length > 0 &&
      participants.includes(participantName) &&
      participantItem.classList.contains('not-completed')
    ) {
      participantItem.classList.remove('not-completed');
      participantItem.classList.add('completed');
      participantItem.querySelector('.line-2').innerText = 'completed';
      participantItem.querySelector('.actions button').removeAttribute('disabled');
      participants.pop();
      completedParticipants.push(participantName);
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
    LoaderOverlay.toggle('Preparing results...');

    sessionStorage.setItem('participant-result', participantName);

    setTimeout(() => {
      Router.switchPage('results.html');
    }, 1000);
  });
}

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
  } else {
    for (const participantItem of participantList) {
      participantItem.classList.toggle('selected');
      participants.pop();
    }

    selectBtnAll.innerHTML = 'Select All';
    isAllSelected = false;
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

    selectBtnNotCompleted.innerHTML = 'Select Not Completed';
    isAllNotCompletedSelected = false;
  }

  toggleSubmitBtn();
  toggleParticipantStorage();
});

submitBtn.addEventListener('click', () => {
  if (!submitBtn.disabled) {
    LoaderOverlay.toggle();

    setTimeout(() => {
      Router.switchPage('angle-selection.html');
    }, 2000);
  }
});
