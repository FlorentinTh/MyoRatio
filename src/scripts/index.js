import '../styles/main.css';

import { LoaderOverlay } from './components/loader-overlay.js';
import { Router } from './routes/router.js';

const loaderOverlay = new LoaderOverlay();
loaderOverlay.toggle({ message: 'Loading Application Components...' });

const router = new Router();
router.disableBackButton();

setTimeout(() => {
  router.switchPage('data-discovering');
}, 2000);
