import LoaderOverlay from './components/loader-overlay.js';
import Menu from './components/menu.js';
import Router from './utils/router.js';

Router.disableBackButton();

const resetBtn = document.querySelector('button[type="reset"]');

resetBtn.addEventListener('click', () => {
  Router.switchPage('participants-selection.html');
});

const menuBtns = [];
menuBtns.push(document.querySelector('.auto-angles-btn'));

const menu = new Menu();
menu.init(menuBtns);

const data = [
  {
    x: [0, 2, 4, 6, 8, 10],
    y: [
      Math.floor(Math.random() * (100 - 90 + 1) + 90),
      Math.floor(Math.random() * (45 - 30 + 1) + 30),
      Math.floor(Math.random() * (45 - 30 + 1) + 30),
      Math.floor(Math.random() * (45 - 30 + 1) + 30),
      Math.floor(Math.random() * (100 - 90 + 1) + 90),
      Math.floor(Math.random() * (100 - 90 + 1) + 90)
    ]
  }
];

const layout = {
  margin: { t: 20, r: 30, b: 20, l: 30 },
  paper_bgcolor: '#EDEDED',
  plot_bgcolor: '#EDEDED'
};

const config = {
  responsive: true
};

const participants = sessionStorage.getItem('participants').split(',');
const analysis = sessionStorage.getItem('analysis');

const infoParticipant = document.getElementById('participant');
const infoAnalysis = document.getElementById('analysis');
const infoIter = document.getElementById('iteration');

const plotElement = document.getElementById('plot');

const dots = document.querySelector('.pager').children;
const submitBtn = document.querySelector('button[type="submit"]');

let currentParticipant = 0;
let currentIteration = 0;

infoAnalysis.innerText = analysis;

function updateInfos() {
  infoParticipant.innerText = participants[currentParticipant];
  infoIter.innerText = `Iter. ${currentIteration + 1}`;

  if (currentIteration > 0) {
    dots[currentIteration - 1].classList.toggle('active');
  } else {
    dots[dots.length - 1].classList.remove('active');
  }

  dots[currentIteration].classList.toggle('active');

  if (currentIteration === 2 && currentParticipant + 1 === participants.length) {
    submitBtn.innerText = `Terminer`;
    submitBtn.classList.add('completed');
  }
}

updateInfos();

// eslint-disable-next-line no-undef
Plotly.newPlot(plotElement, data, layout, config);

submitBtn.addEventListener('click', () => {
  if (submitBtn.classList.contains('completed')) {
    LoaderOverlay.toggle();
    sessionStorage.setItem('results-available', true);

    setTimeout(() => {
      Router.switchPage('participants-selection.html');
    }, 2000);
  } else {
    // eslint-disable-next-line no-undef
    Plotly.newPlot(
      plotElement,
      [
        {
          x: [0, 2, 4, 6, 8, 10],
          y: [
            Math.floor(Math.random() * (100 - 90 + 1) + 90),
            Math.floor(Math.random() * (45 - 30 + 1) + 30),
            Math.floor(Math.random() * (45 - 30 + 1) + 30),
            Math.floor(Math.random() * (45 - 30 + 1) + 30),
            Math.floor(Math.random() * (100 - 90 + 1) + 90),
            Math.floor(Math.random() * (100 - 90 + 1) + 90)
          ]
        }
      ],
      layout,
      config
    );

    if (currentIteration < 2) {
      currentIteration++;
    } else {
      currentIteration = 0;
      currentParticipant++;
    }

    updateInfos();
  }
});
