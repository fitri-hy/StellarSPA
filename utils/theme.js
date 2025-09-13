import { AppConfig } from '../config/app.config.js';
import { debugLog } from '../utils/debug.js';
import { DarkModeButton } from '../views/components/darkModeButton.js';
import { USF } from '../app/States.js';

function addTransition() {
    document.documentElement.style.transition = 'background-color 0.3s, color 0.3s';
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 300);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    debugLog(`Theme applied: ${theme}`);
    updateDarkModeButton();
}

export function isDarkMode() {
    return USF.get('theme') === 'dark';
}

export function updateDarkModeButton() {
    const btn = document.getElementById('darkModeBtn');
    if (!btn) return;

    const icon = isDarkMode()
        ? DarkModeButton().match(/<svg[\s\S]*<\/svg>/)[0]
        : DarkModeButton().match(/<svg[\s\S]*<\/svg>/)[0];

    btn.innerHTML = icon;
}

export function toggleDarkMode() {
    addTransition();
    const newTheme = isDarkMode() ? 'light' : 'dark';
    USF.set('theme', newTheme);
}

export function initTheme() {
    let theme = USF.get('theme');

    if (!theme) {
        const mode = AppConfig.theme.darkMode;
        if (mode === true) theme = 'dark';
        else if (mode === false) theme = 'light';
        else if (mode === 'auto') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        } else {
            theme = 'light';
        }

        USF.set('theme', theme);
    } else {
        applyTheme(theme);
    }
}

USF.subscribe('theme', (newTheme) => {
    applyTheme(newTheme);
});

initTheme();

window.toggleDarkMode = toggleDarkMode;
