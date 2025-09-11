import { AppConfig } from '../config/app.config.js';
import { debugLog, debugWarn, debugError } from '../utils/debug.js';

export const ApiService = (() => {
    const DEFAULT_TIMEOUT = AppConfig.api.defaultTimeout || 10000;
    const MAX_RETRIES = AppConfig.api.maxRetries || 3;
    const USE_CACHE = AppConfig.api.useCache ?? true;

    const cache = new Map();

    const interceptors = {
        request: [],
        response: []
    };

    function addRequestInterceptor(fn) { interceptors.request.push(fn); }
    function addResponseInterceptor(fn) { interceptors.response.push(fn); }

    async function request(url, { method = 'GET', body = null, headers = {}, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES, useCache = USE_CACHE } = {}) {
        let attempt = 0;

        while (attempt < retries) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeout);

            try {
                for (const fn of interceptors.request) {
                    ({ url, method, body, headers } = await fn({ url, method, body, headers }) || { url, method, body, headers });
                }

                if (body && (method === 'POST' || method === 'PUT')) {
                    body = JSON.stringify(body);
                    headers['Content-Type'] = 'application/json';
                }

                if (method === 'GET' && useCache && cache.has(url)) {
                    clearTimeout(timer);
                    debugLog(`Cache hit: ${url}`);
                    return cache.get(url);
                }

                const res = await fetch(url, { method, headers, body, signal: controller.signal });
                clearTimeout(timer);

                let data;
                try { data = await res.json(); }
                catch { data = await res.text(); }

                if (!res.ok) throw new Error(data?.message || `Request failed with status ${res.status}`);

                for (const fn of interceptors.response) {
                    data = await fn(data, res) || data;
                }

                if (method === 'GET' && useCache) cache.set(url, data);

                debugLog(`${method} success: ${url}`);
                return data;
            } catch (err) {
                clearTimeout(timer);
                attempt++;
                if (attempt >= retries || method !== 'GET' || err.name === 'AbortError') {
                    debugError(`${method} error:`, err);
                    throw err;
                }
                debugWarn(`Retrying GET ${url} (attempt ${attempt})...`);
            }
        }
    }

    return {
        get: (url, options = {}) => request(url, { ...options, method: 'GET' }),
        post: (url, body, options = {}) => request(url, { ...options, method: 'POST', body }),
        put: (url, body, options = {}) => request(url, { ...options, method: 'PUT', body }),
        delete: (url, options = {}) => request(url, { ...options, method: 'DELETE' }),
        addRequestInterceptor,
        addResponseInterceptor,
        cache
    };
})();
