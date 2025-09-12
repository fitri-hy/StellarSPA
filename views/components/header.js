import { AppConfig } from '../../config/app.config.js';
import { DarkModeButton } from './darkModeButton.js';
import { NavLink } from '../../utils/navlink.js';

export function Header() {
    const appName = AppConfig.system?.appname;
    setTimeout(() => NavLink(), 0);

    return `
    <nav class="flex justify-between items-center gap-4 w-full px-4 py-2 bg-white dark:bg-slate-800 shadow-sm shadow-neutral-100 dark:shadow-neutral-900/40">
        <a href="#/" class="flex items-center gap-1">
			<img src="/assets/images/icon.png" alt="stellarSPA" class="h-8 w-8 rounded-full Object-cover" />
			<h1 class="font-bold text-xl text-[#43a0d9]">
				${appName}
			</h1>
		</a>
        <div class="flex items-center gap-6">
			<nav class="flex items-center gap-4">
				<a href="#/" class="nav-link hover:underline">Home</a>
				<a href="#/blog" class="nav-link hover:underline">Blog</a>
			</nav>
            ${DarkModeButton()}
        </div>
    </nav>
    `;
}
