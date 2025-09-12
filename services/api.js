import { httpRequest } from '../app/Https.js';
import { AppConfig } from '../config/app.config.js';
import { debugLog, debugWarn, debugError } from '../utils/debug.js';
import { USF } from '../app/States.js';

export const ApiService = (() => {
    const cache = new Map();
    const interceptors = { request: [], response: [] };

    function addRequestInterceptor(fn) { interceptors.request.push(fn); }
    function addResponseInterceptor(fn) { interceptors.response.push(fn); }

    async function request(url, options = {}) {
        const { method = 'GET', body, headers = {}, useCache = AppConfig.api.useCache } = options;
        const timeout = options.timeout ?? AppConfig.api.defaultTimeout;
        const retries = options.retries ?? AppConfig.api.maxRetries;

        USF.set('loading', true);

        try {
            let req = { url, method, body, headers };

            for (const fn of interceptors.request) req = (await fn(req)) || req;

            if (method === 'GET' && useCache && cache.has(req.url)) {
                debugLog(`Cache hit: ${req.url}`);
                return cache.get(req.url);
            }

            const data = await httpRequest(req.url, { method: req.method, body: req.body, headers: req.headers, timeout, retries });

            let resData = data;
            for (const fn of interceptors.response) resData = (await fn(resData, req)) || resData;

            if (method === 'GET' && useCache) cache.set(req.url, resData);

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
