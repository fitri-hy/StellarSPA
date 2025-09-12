import { AppConfig } from '../config/app.config.js';

export function SkeletonList({ count = 5, className = '', itemTemplate, active = false } = {}) {
    if (!AppConfig.ui?.useSkeleton || !active) return '';

    const defaultItem = () => `
        <div class="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg shadow animate-pulse flex space-x-4">
            <div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
            <div class="flex-1 space-y-2 py-1">
                <div class="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
        </div>
    `;

    const itemHTML = itemTemplate || defaultItem;
    return `<div class="${className} space-y-4">${Array.from({ length: count }).map(() => itemHTML()).join('')}</div>`;
}

export function SkeletonCard({ className = '', active = false } = {}) {
    if (!AppConfig.ui?.useSkeleton || !active) return '';

    return `
        <div class="p-6 bg-gray-200 dark:bg-gray-700 rounded-lg shadow animate-pulse space-y-4 ${className}">
            <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
        </div>
    `;
}
