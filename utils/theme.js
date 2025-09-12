import { AppConfig } from '../config/app.config.js';
import { debugLog } from '../utils/debug.js';
import { DarkModeButton } from '../views/components/darkModeButton.js';

const STORAGE_KEY = 'darkMode';

function addTransition() {
    document.documentElement.style.transition = 'background-color 0.3s, color 0.3s';
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 300);
}

export function isDarkMode() {
    return document.documentElement.classList.contains('dark');
}

export function updateDarkModeButton() {
    const btn = document.getElementById('darkModeBtn');
    if (!btn) return;

    const iconMatch = DarkModeButton().match(/<svg[\s\S]*<\/svg>/);
    if (iconMatch) {
        btn.innerHTML = iconMatch[0];
    }
}

export function toggleDarkMode() {
    addTransition();
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEY, dark);
    debugLog(`Theme: ${dark ? 'dark' : 'light'}`);
    updateDarkModeButton();
}

export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
        if (saved === 'true') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    } else {
        const mode = AppConfig.theme.darkMode;

        if (mode === true) document.documentElement.classList.add('dark');
        else if (mode === false) document.documentElement.classList.remove('dark');
        else if (mode === 'auto') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }

    updateDarkModeButton();
}

initTheme();

window.toggleDarkMode = toggleDarkMode;
