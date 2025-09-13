import { httpRequest } from '../app/Https.js';
import { AppConfig } from '../config/app.config.js';
import { USF } from '../app/States.js';
import { debugLog, debugWarn, debugError } from '../utils/debug.js';

export const ApiService = (() => {
    const cache = new Map();
    const interceptors = { request: [], response: [] };

    const STORAGE_KEY = 'ApiCache_v1';

    // Load cache dari localStorage saat init
    const savedCache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    for (const [key, value] of Object.entries(savedCache)) {
        cache.set(key, value);
    }

    function persistCache() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(cache)));
    }

    function addRequestInterceptor(fn) { interceptors.request.push(fn); }
    function addResponseInterceptor(fn) { interceptors.response.push(fn); }

    async function request(url, options = {}) {
        const { 
            method = 'GET', 
            body, 
            headers = {}, 
            useCache = AppConfig.api.useCache, 
            swr = true // default aktifin SWR
        } = options;

        const timeout = options.timeout ?? AppConfig.api.defaultTimeout;
        const retries = options.retries ?? AppConfig.api.maxRetries;

        USF.set('loading', true);

        try {
            let req = { url, method, body, headers };

            for (const fn of interceptors.request) req = (await fn(req)) || req;

            // Cek cache dulu (SWR logic)
            if (method === 'GET' && useCache && cache.has(req.url)) {
                const cachedData = cache.get(req.url);
                debugLog(`Cache hit: ${req.url}`, cachedData);

                if (swr) {
                    // Fetch ulang di background → update state
                    httpRequest(req.url, { method, body, headers, timeout, retries })
                        .then(async freshData => {
                            let resFresh = freshData;
                            for (const fn of interceptors.response) resFresh = (await fn(resFresh, req)) || resFresh;
                            cache.set(req.url, resFresh);
                            persistCache();
                            debugLog(`SWR refreshed: ${req.url}`, resFresh);

                            // Update state kalau ada key terkait
                            if (options.stateKey) {
                                USF.set(options.stateKey, resFresh);
                            }
                        })
                        .catch(err => debugWarn(`SWR failed for ${req.url}`, err));
                }

                return cachedData; // return cache langsung (fast render)
            }

            // Kalau gak ada cache → request normal
            const data = await httpRequest(req.url, { method, body, headers, timeout, retries });

            let resData = data;
            for (const fn of interceptors.response) resData = (await fn(resData, req)) || resData;

            if (method === 'GET' && useCache) {
                cache.set(req.url, resData);
                persistCache();
            }

            return resData;
        } finally {
            USF.set('loading', false);
        }
    }

    return {
        get: (url, options) => request(url, { ...options, method: 'GET' }),
        post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
        put: (url, body, options) => request(url, { ...options, method: 'PUT', body }),
        delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
        addRequestInterceptor,
        addResponseInterceptor,
        cache
    };
})();
