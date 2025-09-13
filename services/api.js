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
        const {
            method = 'GET',
            body,
            headers = {},
            useCache = AppConfig.api.useCache,
            stateKey,
            swr = false,
        } = options;

        const timeout = options.timeout ?? AppConfig.api.defaultTimeout;
        const retries = options.retries ?? AppConfig.api.maxRetries;

        USF.set('loading', true);
        USF.emit('fetch:start', { url, method });

        try {
            let req = { url, method, body, headers };
            for (const fn of interceptors.request) req = (await fn(req)) || req;

            if (method === 'GET' && useCache && cache.has(req.url)) {
                const cached = cache.get(req.url);
                debugLog(`Cache hit: ${req.url}`);

                if (stateKey) USF.set(stateKey, cached);

                if (swr) {
                    fetchFresh(req, stateKey, timeout, retries);
                }
                return cached;
            }

            const data = await httpRequest(req.url, { method: req.method, body: req.body, headers: req.headers, timeout, retries });

            let resData = data;
            for (const fn of interceptors.response) resData = (await fn(resData, req)) || resData;

            if (method === 'GET' && useCache) cache.set(req.url, resData);

            if (stateKey) USF.set(stateKey, resData);

            USF.emit('fetch:success', { url, data: resData });
            return resData;
        } catch (err) {
            USF.emit('fetch:error', { url, error: err });
            throw err;
        } finally {
            USF.set('loading', false);
            USF.emit('fetch:end', { url });
        }
    }

    async function fetchFresh(req, stateKey, timeout, retries) {
        try {
            const freshData = await httpRequest(req.url, { method: req.method, body: req.body, headers: req.headers, timeout, retries });
            if (stateKey) USF.set(stateKey, freshData);
            cache.set(req.url, freshData);
            USF.emit('fetch:refresh', { url: req.url, data: freshData });
        } catch (err) {
            debugWarn('Background refresh failed:', err);
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
