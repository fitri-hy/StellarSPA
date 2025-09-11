import { sanitizeObject } from '../utils/sanitize.js';
import { debugLog, debugWarn, debugError } from '../utils/debug.js';

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 3;

async function httpRequest(url, { method = 'GET', body, headers = {}, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES } = {}) {
    if (body && (method === 'POST' || method === 'PUT')) {
        body = JSON.stringify(sanitizeObject(body));
        headers['Content-Type'] = 'application/json';
        debugLog(`${method} body sanitized:`, body);
    }

    let attempt = 0;

    while (attempt < retries) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
            debugLog(`HTTP ${method} request:`, url, headers);
            const res = await fetch(url, { method, body, headers, signal: controller.signal });
            clearTimeout(timer);

            let data;
            try {
                data = await res.json();
            } catch {
                data = await res.text();
            }

            if (method === 'GET' || method === 'DELETE') {
                data = sanitizeObject(data);
            }

            if (!res.ok) {
                throw new Error(data?.message || `Request failed with status ${res.status}`);
            }

            debugLog(`HTTP ${method} success:`, url, data);
            return data;
        } catch (err) {
            clearTimeout(timer);
            attempt++;

            if (attempt < retries && (err.name === 'AbortError' || err.message.includes('NetworkError'))) {
                debugWarn(`Attempt ${attempt} failed, retrying...`);
                continue;
            }

            debugError('HTTP Error:', err);
            throw { status: err.status || 500, message: err.message };
        }
    }
}

export const GET = (url, options = {}) => httpRequest(url, { ...options, method: 'GET' });
export const POST = (url, body, options = {}) => httpRequest(url, { ...options, method: 'POST', body });
export const PUT = (url, body, options = {}) => httpRequest(url, { ...options, method: 'PUT', body });
export const DELETE = (url, options = {}) => httpRequest(url, { ...options, method: 'DELETE' });
