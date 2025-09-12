import { AppConfig } from '../../config/app.config.js';

export function Footer() {
    const appName = AppConfig.system?.appname;
	
    return `
    <footer class="w-full text-sm text-neutral-600 dark:text-neutral-400 text-center px-4 py-2">
        &copy;${new Date().getFullYear()} <span class="font-semibold">${appName}</span>. All rights reserved.
    </footer>
    `;
}
