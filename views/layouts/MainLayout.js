import { USF } from '../../app/States.js';
import { SkeletonList } from '../../utils/skeleton.js';
import { Header } from '../components/header.js';
import { Footer } from '../components/footer.js';

export function MainLayout(content) {
    const isLoading = USF.get('loading', false);

    return `
    <main class="flex flex-col min-h-screen bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/60 dark:from-slate-900 dark:via-gray-900 dark:to-neutral-900 text-neutral-700 dark:text-neutral-200">
        <img class="fixed top-0 right-0 -z-10" src="/assets/images/shape.png" alt="shape.png" />
		
		${Header()}

        <section class="flex-1 p-4 md:p-6 flex flex-col">
            ${isLoading ? SkeletonList({ count: 5 }) : content}
        </section>

        ${Footer()}
    </main>
    `;
}