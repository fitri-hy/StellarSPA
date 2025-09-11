import { toggleDarkMode } from '../../utils/theme.js';
import { USF } from '../../app/States.js';
import { SkeletonList } from '../../utils/skeleton.js';

export function MainLayout(content) {
    const isLoading = USF.get('loading', false);

    return `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <nav class="p-4 bg-blue-500 text-white flex justify-between items-center">
            <span class="font-bold">NOVA App</span>
            <div class="space-x-4">
                <a href="#/" class="hover:underline">Home</a>
                <a href="#/dashboard" class="hover:underline">Dashboard</a>
                <button onclick="toggleDarkMode()" class="ml-2 px-3 py-1 bg-gray-800 text-white rounded">Toggle Dark</button>
            </div>
        </nav>
        <main class="p-6">
            ${isLoading ? SkeletonList({ count: 5 }) : content}
        </main>
    </div>
    `;
}
