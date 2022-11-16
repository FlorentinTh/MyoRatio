import LoaderOverlay from './components/loader-overlay.js';
import Menu from './components/menu.js';
import Router from './utils/router.js';

const menuBtns = [];
menuBtns.push(document.querySelector('.auto-angles-btn'));

const menu = new Menu();
menu.init(menuBtns);

const data = [
  {
    x: [
      Math.floor(Math.random() * 16) + 1,
      Math.floor(Math.random() * 16) + 1,
      Math.floor(Math.random() * 16) + 1,
      Math.floor(Math.random() * 16) + 1,
      Math.floor(Math.random() * 16) + 1
    ],
    y: [
      Math.floor(Math.random() * 16) + 5,
      Math.floor(Math.random() * 16) + 5,
      Math.floor(Math.random() * 16) + 5,
      Math.floor(Math.random() * 16) + 5,
      Math.floor(Math.random() * 16) + 5
    ]
  }
];

const layout = {
  margin: { t: 20, r: 20, b: 20, l: 20 },
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

    setTimeout(() => {
      Router.switchPage('results.html');
    }, 2000);
  } else {
    // eslint-disable-next-line no-undef
    Plotly.newPlot(
      plotElement,
      [
        {
          x: [
            Math.floor(Math.random() * 16) + 1,
            Math.floor(Math.random() * 16) + 1,
            Math.floor(Math.random() * 16) + 1,
            Math.floor(Math.random() * 16) + 1,
            Math.floor(Math.random() * 16) + 1
          ],
          y: [
            Math.floor(Math.random() * 16) + 5,
            Math.floor(Math.random() * 16) + 5,
            Math.floor(Math.random() * 16) + 5,
            Math.floor(Math.random() * 16) + 5,
            Math.floor(Math.random() * 16) + 5
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
