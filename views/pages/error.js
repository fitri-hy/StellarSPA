import { USF } from '../../app/States.js';

export function NotFound() {
    const err = USF.get('lastError', { code: 404, message: 'Page not found' });

    return `
         <section class="px-4 md:px-9 py-6 m-auto">
			<div class="flex flex-col justify-center items-center max-w-lg mx-auto">
                <h1 class="text-5xl font-extrabold text-red-500 mb-4">
                    ${err.code}
                </h1>
                <p class="text-center text-2xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                    ${err.message}
                </p>
                <a href="#/" class="underline transition-colors">
                    Back to Home
                </a>
            </div>
        </section>
    `;
}

export function InternalError(error) {
    const err = error?.message || 'Unexpected server error';
    USF.set('lastError', { code: 500, message: err });

    return `
        <section class="px-4 md:px-9 py-6 m-auto">
			<div class="flex flex-col justify-center items-center max-w-lg mx-auto">
                <h1 class="text-5xl font-extrabold text-red-500 mb-4">
                    500
                </h1>
                <p class="text-center text-2xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                       Internal Server Error
                </p>
                <pre class="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg text-left overflow-auto max-w-2xl w-full mb-6 shadow">
${errMsg}</pre>
                <a href="#/" class="underline transition-colors">
                    Back to Home
                </a>
            </div>
        </section>
    `;
}
