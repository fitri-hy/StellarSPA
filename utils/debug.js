import { AppConfig } from '../config/app.config.js';

export function debugLog(...args) {
    if (AppConfig.debug) {
        console.log('%c[DEBUG]', 'color: #0a84ff; font-weight: bold;', ...args);
    }
}

export function debugWarn(...args) {
    if (AppConfig.debug) {
        console.warn('%c[DEBUG]', 'color: #ff9500; font-weight: bold;', ...args);
    }
}

export function debugError(...args) {
    if (AppConfig.debug) {
        console.error('%c[DEBUG]', 'color: #ff3b30; font-weight: bold;', ...args);
    }
}
