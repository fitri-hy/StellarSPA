import { httpRequest } from '../app/Https.js';
import { AppConfig } from '../config/app.config.js';
import { debugLog, debugWarn, debugError } from '../utils/debug.js';
import { USF } from '../app/States.js';

export const ApiService = (() => {
    const cache = new Map();
    const interceptors = { request: [], response: [] };
    let activeRequests = 0;

    function addRequestInterceptor(fn) {
        interceptors.request.push(fn);
        return () => {
            interceptors.request = interceptors.request.filter(i => i !== fn);
        };
    }

    function addResponseInterceptor(fn) {
        interceptors.response.push(fn);
        return () => {
            interceptors.response = interceptors.response.filter(i => i !== fn);
        };
    }

    function setLoading(isLoading) {
        if (isLoading) {
            activeRequests++;
        } else {
            activeRequests = Math.max(0, activeRequests - 1);
        }
        USF.set('loading', activeRequests > 0);
    }

    async function request(url, options = {}) {
        const { method = 'GET', body, headers = {}, useCache = AppConfig.api.useCache, ttl = 0 } = options;
        const timeout = options.timeout ?? AppConfig.api.defaultTimeout;
        const retries = options.retries ?? AppConfig.api.maxRetries;

        setLoading(true);

        try {
            let req = { url, method, body, headers };

            for (const fn of interceptors.request) {
                req = (await fn(req)) || req;
            }

            if (method === 'GET' && useCache && cache.has(req.url)) {
                const { data, expiry } = cache.get(req.url);
                if (!expiry || Date.now() < expiry) {
                    debugLog(`Cache hit: ${req.url}`);
                    return data;
                }
                cache.delete(req.url);
            }

            const data = await httpRequest(req.url, { method: req.method, body: req.body, headers: req.headers, timeout, retries });

            let resData = data;
            for (const fn of interceptors.response) {
                resData = (await fn(resData, req)) || resData;
            }

            if (method === 'GET' && useCache) {
                cache.set(req.url, { 
                    data: resData, 
                    expiry: ttl ? Date.now() + ttl : null 
                });
            }

            return resData;
        } catch (err) {
            debugError('ApiService Error:', err);
            throw err;
        } finally {
            setLoading(false);
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
