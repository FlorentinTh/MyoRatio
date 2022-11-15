import LoaderOverlay from './components/loader-overlay.js';
import Menu from './components/menu.js';
import Router from './utils/router.js';

const menu = new Menu();
menu.init();

let participants = sessionStorage.getItem('participants')?.split(',') || [];

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

function createSelectedElement(participantItem) {
  const span = document.createElement('span');
  span.innerText = `Selected 🗸`;
  participantItem.querySelector('.status').appendChild(span);
}

const selectBtnAll = document.getElementById('btn-all');
const selectBtnNotCompleted = document.getElementById('btn-not-completed');
const submitBtn = document.querySelector('button[type="submit"]');
const dataPath = document.getElementById('data-path');

const participantList = document.querySelector('ul.list').children;

let isAllSelected = false;

dataPath.innerText += ` ${sessionStorage.getItem('data-path') || 'ERROR'}`;
toggleSubmitBtn();

if (participants.length > 0 && participantList.length === participants.length) {
  selectBtnAll.innerHTML = 'Unselect All';
  isAllSelected = true;
}

for (const participantItem of participantList) {
  const participantName = participantItem.querySelector('.line-1').innerHTML;

  if (
    participants.length > 0 &&
    !participantItem.classList.contains('selected') &&
    participants.includes(participantName)
  ) {
    participantItem.classList.toggle('selected');
    createSelectedElement(participantItem);
    toggleSubmitBtn();
  }

  participantItem.addEventListener('click', () => {
    if (participantItem.classList.contains('selected')) {
      participants = participants.filter(participant => participant !== participantName);
      participantItem.querySelector('.status > span').remove();
    } else {
      participants.push(participantName);

      createSelectedElement(participantItem);
    }

    participantItem.classList.toggle('selected');
    toggleSubmitBtn();
    toggleParticipantStorage();
  });
}

selectBtnAll.addEventListener('click', () => {
  if (!isAllSelected) {
    for (const participantItem of participantList) {
      if (!participantItem.classList.contains('selected')) {
        const participantName = participantItem.querySelector('.line-1').innerHTML;
        participants.push(participantName);
        participantItem.classList.toggle('selected');
        createSelectedElement(participantItem);
      }
    }

    selectBtnAll.innerHTML = 'Unselect All';
    isAllSelected = true;
  } else {
    for (const participantItem of participantList) {
      participantItem.classList.toggle('selected');
      participantItem.querySelector('.status > span').remove();
      participants.pop();
    }

    selectBtnAll.innerHTML = 'Select All';
    isAllSelected = false;
  }

  toggleSubmitBtn();
  toggleParticipantStorage();
});

selectBtnNotCompleted.addEventListener('click', () => {
  for (const participantItem of participantList) {
    const participantItemClasses = participantItem.classList;
    if (
      participantItemClasses.contains('not-completed') &&
      !participantItemClasses.contains('selected')
    ) {
      const participantName = participantItem.querySelector('.line-1').innerHTML;
      participants.push(participantName);
      participantItem.classList.toggle('selected');
      createSelectedElement(participantItem);
    }
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
