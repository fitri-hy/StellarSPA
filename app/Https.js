import { sanitizeObject } from '../utils/sanitize.js';
import { debugLog, debugWarn, debugError } from '../utils/debug.js';
import { AppConfig } from '../config/app.config.js';

async function parseResponse(res) {
    try {
        return await res.json();
    } catch {
        return await res.text();
    }
}

function buildOptions(method, body, headers, signal) {
    const opts = { method, headers: { ...headers }, signal };

    if (body && ['POST', 'PUT'].includes(method)) {
        opts.body = JSON.stringify(sanitizeObject(body));
        opts.headers['Content-Type'] = 'application/json';

        if (AppConfig.debug) debugLog(`${method} body sanitized:`, opts.body);
    }

    return opts;
}

export async function httpRequest(
    url,
    { method = 'GET', body, headers = {}, timeout, retries } = {}
) {
    const DEFAULT_TIMEOUT = timeout ?? AppConfig.api.defaultTimeout;
    const MAX_RETRIES = retries ?? AppConfig.api.maxRetries;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

        try {
            if (AppConfig.debug) debugLog(`HTTP ${method} request:`, url, headers);

            const res = await fetch(url, buildOptions(method, body, headers, controller.signal));
            clearTimeout(timer);

            let data = await parseResponse(res);
            if (['GET', 'DELETE'].includes(method)) data = sanitizeObject(data);

            if (!res.ok) throw new Error(data?.message || `Request failed with status ${res.status}`);

            if (AppConfig.debug) debugLog(`HTTP ${method} success:`, url, data);
            return data;
        } catch (err) {
            clearTimeout(timer);

            const isRetryable = err.name === 'AbortError' || err.message.includes('NetworkError');
            if (attempt < MAX_RETRIES && isRetryable) {
                if (AppConfig.debug) debugWarn(`Attempt ${attempt} failed, retrying...`);
                continue;
            }

            if (AppConfig.debug) debugError('HTTP Error:', err);
            throw { status: err.status || 500, message: err.message };
        }
    }
}

export const GET = (url, options = {}) =>
    httpRequest(url, { ...options, method: 'GET' });
export const POST = (url, body, options = {}) =>
    httpRequest(url, { ...options, method: 'POST', body });
export const PUT = (url, body, options = {}) =>
    httpRequest(url, { ...options, method: 'PUT', body });
export const DELETE = (url, options = {}) =>
    httpRequest(url, { ...options, method: 'DELETE' });
