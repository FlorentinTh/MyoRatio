import '../styles/participants-selection.css';
import participantCard from '../views/partials/participants-list/participant-card.hbs';
import emptyCard from '../views/partials/participants-list/empty-card.hbs';
import report from '../views/partials/pdf-report/report.hbs';

import { Menu } from './components/menu.js';
import { Router } from './routes/router.js';
import { LoaderOverlay } from './components/loader-overlay.js';
import { ErrorOverlay } from './components/error-overlay';
import { getAllParticipants } from './components/participants';
import { Metadata } from './components/metadata.js';
import { PathHelper } from './helpers/path-helper.js';
import { StringHelper } from './helpers/string-helper';

const path = nw.require('path');

const router = new Router();
router.disableBackButton();

const loaderOverlay = new LoaderOverlay();

const menu = new Menu();

const additionalMenuButtons = document.querySelectorAll('[class^="export-"]');
menu.init(additionalMenuButtons);

const dataFolderPathSession = sessionStorage.getItem('data-path');
const analysisType = sessionStorage.getItem('analysis');

const changeButton = document.getElementById('change-btn');
changeButton.addEventListener('click', () => {
  if (!(dataFolderPathSession === null)) {
    sessionStorage.removeItem('data-path');
  }

  router.switchPage('data-discovering');
});

const exportPDFButton = document.querySelector('.export-pdf-btn');
const dataPath = document.getElementById('data-path');
const analysisTitle = document.querySelector('.analysis h3');
const previewButton = document.getElementById('btn-preview');
const selectButtonAll = document.getElementById('btn-all');
const selectButtonNotCompleted = document.getElementById('btn-not-completed');
const submitButton = document.querySelector('button[type="submit"]');
const participantList = document.querySelector('ul.list');

dataPath.querySelector('p').innerText = ` ${
  sessionStorage.getItem('data-path') || 'ERROR'
}`;

analysisTitle.innerText += ` ${analysisType}`;

const displayEmptyCard = () => {
  previewButton.setAttribute('disabled', '');
  selectButtonAll.setAttribute('disabled', '');
  selectButtonNotCompleted.setAttribute('disabled', '');
  participantList.insertAdjacentHTML('afterbegin', emptyCard());
};

const displayParticipantCard = (participant, infos) => {
  participantList.insertAdjacentHTML(
    'afterbegin',
    participantCard({ participant, infos })
  );
};

const analysisFolderPath = path.join(dataFolderPathSession, analysisType);
const sanitizedAnalysisFolderPath = PathHelper.sanitizePath(analysisFolderPath);
const participants = await getAllParticipants(sanitizedAnalysisFolderPath);
const metadata = new Metadata(dataFolderPathSession);

const participantsObject = [];

if (!(participants?.length > 0)) {
  displayEmptyCard();
} else {
  for (const participant of participants) {
    const participantName = StringHelper.formatParticipantName(participant);
    const infos = await metadata.getParticipantInfo(
      PathHelper.sanitizePath(analysisType),
      participantName
    );

    participantsObject.push({
      name: participant,
      infos
    });

    displayParticipantCard(participantName, infos);
  }

  let selectedParticipants =
    sessionStorage.getItem('selected-participants')?.split(',') || [];

  const toggleSubmitButton = () => {
    if (selectedParticipants.length > 0) {
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

  const toggleSelectedParticipantStorage = () => {
    if (selectedParticipants.length > 0) {
      sessionStorage.setItem('selected-participants', selectedParticipants.join(','));
    } else {
      sessionStorage.removeItem('selected-participants');
    }
  };

  const participantItems = document.querySelector('ul.list').children;

  let totalCompleted = 0;

  for (const participantItem of participantItems) {
    if (participantItem.classList.contains('completed')) {
      totalCompleted++;
    }

    const participantName = participantItem
      .querySelector('.line-1')
      .innerText.toLowerCase();

    participantItem.querySelector('.content').addEventListener('click', () => {
      if (participantItem.classList.contains('selected')) {
        selectedParticipants = selectedParticipants.filter(
          participant => participant !== participantName
        );
      } else {
        selectedParticipants.push(participantName.trim());
      }

      participantItem.classList.toggle('selected');
      toggleSubmitButton();
      toggleSelectedParticipantStorage();
    });

    const resultsButton = participantItem.querySelector('.actions > button');

    if (!(resultsButton === null)) {
      resultsButton.addEventListener('click', () => {
        loaderOverlay.toggle({ message: 'Preparing results...' });

        sessionStorage.setItem('participant-result', participantName.trim());

        setTimeout(() => {
          router.switchPage('results');
        }, 1000);
      });
    }
  }

  const disableNotRequiredButton = () => {
    if (totalCompleted === participants.length) {
      selectButtonNotCompleted.setAttribute('disabled', '');
    } else if (!(totalCompleted > 0)) {
      selectButtonAll.setAttribute('disabled', '');
    }
  };

  disableNotRequiredButton();

  previewButton.addEventListener('click', () => {
    if (!previewButton.disabled) {
      loaderOverlay.toggle({ message: 'Preparing data...' });

      setTimeout(() => {
        router.switchPage('angles-preview');
      }, 2000);
    }
  });

  const selectParticipant = participantItem => {
    const participantName = participantItem
      .querySelector('.line-1')
      .innerText.toLowerCase();
    selectedParticipants.push(participantName.trim());
    participantItem.classList.toggle('selected');
  };

  let isAllSelected = false;
  let isAllNotCompletedSelected = false;

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

    disableNotRequiredButton();
  };

  selectButtonAll.addEventListener('click', () => {
    if (!isAllSelected) {
      for (const participantItem of participantItems) {
        if (!participantItem.classList.contains('selected')) {
          selectParticipant(participantItem);
        }
      }

      toggleSelectButtons(true);
    } else {
      for (const participantItem of participantItems) {
        participantItem.classList.toggle('selected');
        selectedParticipants.pop();
      }

      toggleSelectButtons(false);
    }

    toggleSubmitButton();
    toggleSelectedParticipantStorage();
  });

  selectButtonNotCompleted.addEventListener('click', () => {
    if (!isAllNotCompletedSelected) {
      for (const participantItem of participantItems) {
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
      for (const participantItem of participantItems) {
        const participantItemClasses = participantItem.classList;

        if (
          participantItemClasses.contains('not-completed') &&
          participantItemClasses.contains('selected')
        ) {
          participantItem.classList.toggle('selected');
          selectedParticipants.pop();
        }
      }

      toggleSelectButtons(false, false);
    }

    toggleSubmitButton();
    toggleSelectedParticipantStorage();
  });

  submitButton.addEventListener('click', () => {
    if (!submitButton.disabled) {
      loaderOverlay.toggle({ message: 'Preparing data...' });

      setTimeout(() => {
        router.switchPage('angles-selection');
      }, 1000);
    }
  });

  exportPDFButton.addEventListener('click', async () => {
    loaderOverlay.toggle({ message: 'Creating PDF report...' });

    const sanitizedPDFPath = PathHelper.sanitizePath(
      path.join(analysisFolderPath, `${analysisType}_report.pdf`)
    );

    const { PDFReport } = await import('./components/pdf-report');
    const pdfReport = new PDFReport(sanitizedPDFPath);

    try {
      await pdfReport.create(
        report({
          analysis: analysisType,
          participants: participantsObject
        })
      );
    } catch (error) {
      const errorOverlay = new ErrorOverlay({
        message: `Error occurs while trying create PDF report`,
        details: error.message,
        interact: true
      });

      errorOverlay.show();
    }

    loaderOverlay.toggle();
  });
}
