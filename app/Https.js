import { sanitizeObject } from '../utils/sanitize.js';
import { debugLog, debugWarn, debugError } from '../utils/debug.js';
import { AppConfig } from '../config/app.config.js';

export async function httpRequest(url, { method = 'GET', body, headers = {}, timeout, retries } = {}) {
    const DEFAULT_TIMEOUT = timeout ?? AppConfig.api.defaultTimeout;
    const MAX_RETRIES = retries ?? AppConfig.api.maxRetries;

    if (body && (method === 'POST' || method === 'PUT')) {
        body = JSON.stringify(sanitizeObject(body));
        headers['Content-Type'] = 'application/json';
        if (AppConfig.debug) debugLog(`${method} body sanitized:`, body);
    }

    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

        try {
            if (AppConfig.debug) debugLog(`HTTP ${method} request:`, url, headers);
            const res = await fetch(url, { method, body, headers, signal: controller.signal });
            clearTimeout(timer);

            let data;
            try { data = await res.json(); }
            catch { data = await res.text(); }

            if (method === 'GET' || method === 'DELETE') data = sanitizeObject(data);

            if (!res.ok) throw new Error(data?.message || `Request failed with status ${res.status}`);

            if (AppConfig.debug) debugLog(`HTTP ${method} success:`, url, data);
            return data;
        } catch (err) {
            clearTimeout(timer);
            attempt++;
            if (attempt < MAX_RETRIES && (err.name === 'AbortError' || err.message.includes('NetworkError'))) {
                if (AppConfig.debug) debugWarn(`Attempt ${attempt} failed, retrying...`);
                continue;
            }
            if (AppConfig.debug) debugError('HTTP Error:', err);
            throw { status: err.status || 500, message: err.message };
        }
    }
}

export const GET = (url, options = {}) => httpRequest(url, { ...options, method: 'GET' });
export const POST = (url, body, options = {}) => httpRequest(url, { ...options, method: 'POST', body });
export const PUT = (url, body, options = {}) => httpRequest(url, { ...options, method: 'PUT', body });
export const DELETE = (url, options = {}) => httpRequest(url, { ...options, method: 'DELETE' });
