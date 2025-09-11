import { initState } from './States.js';
import { initRouter } from './Routers.js';
import { GET, POST, PUT, DELETE } from './Https.js';
import { debugLog } from '../utils/debug.js';

function initApp() {
    debugLog('Initializing app...');
    initState();
    initRouter();

    window.GET = GET;
    window.POST = POST;
    window.PUT = PUT;
    window.DELETE = DELETE;

    debugLog('App initialized successfully');
}

initApp();
