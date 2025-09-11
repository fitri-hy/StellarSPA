export function NotFound() {
    return `
        <div class="text-center mt-20">
            <h1 class="text-5xl font-bold mb-4">404</h1>
            <p class="text-xl mb-4">Oops! Page not found.</p>
            <a href="#/" class="text-blue-500 hover:underline">Go back home</a>
        </div>
    `;
}

export function InternalError(error) {
    return `
        <div class="text-center mt-20">
            <h1 class="text-5xl font-bold mb-4">500</h1>
            <p class="text-xl mb-4">Internal Server Error</p>
            <pre class="bg-gray-100 p-4 rounded text-left overflow-auto">${error?.message || ''}</pre>
            <a href="#/" class="text-blue-500 hover:underline">Go back home</a>
        </div>
    `;
}
