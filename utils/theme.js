import { AppConfig } from '../config/app.config.js';
import { debugLog } from '../utils/debug.js';

const STORAGE_KEY = 'darkMode';

function addTransition() {
    document.documentElement.style.transition = 'background-color 0.3s, color 0.3s';
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 300);
}

function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
        if (saved === 'true') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    } else {
        const mode = AppConfig.theme.darkMode;

        if (mode === true) {
            document.documentElement.classList.add('dark');
        } else if (mode === false) {
            document.documentElement.classList.remove('dark');
        } else if (mode === 'auto') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }
}

export function toggleDarkMode() {
    addTransition();
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEY, isDark);
    debugLog(`Theme: ${isDark ? 'dark' : 'light'}`);
}

initTheme();

window.toggleDarkMode = toggleDarkMode;
