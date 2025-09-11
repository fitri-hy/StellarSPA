// Fungsi anti-XSS & sanitasi string
export function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function sanitizeObject(obj, seen = new WeakSet()) {
    if (obj && typeof obj === 'object') {
        if (seen.has(obj)) return null;
        seen.add(obj);

        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeObject(item, seen));
        } else {
            const sanitized = {};
            for (const key in obj) {
                if (/^on/i.test(key)) continue;
                sanitized[key] = sanitizeObject(obj[key], seen);
            }
            return sanitized;
        }
    } else if (typeof obj === 'string') {
        return escapeHTML(obj);
    } else {
        return obj;
    }
}
