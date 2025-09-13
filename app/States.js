import { AppConfig } from '../config/app.config.js';
import { debugLog } from '../utils/debug.js';

class GlobalState {
    constructor() {
        this.state = {};
        this.listeners = {};
        this.globalListeners = [];
        this.computed = {};
        this.middlewares = { before: [], after: [] };
        this._updatingComputed = false;
        this.events = {};
    }

    on(event, fn) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(fn);
        debugLog(`Event subscribed: ${event}`);
        return () => this.off(event, fn);
    }

    once(event, fn) {
        const wrapper = (payload) => {
            fn(payload);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    off(event, fn) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(f => f !== fn);
            debugLog(`Event unsubscribed: ${event}`);
        }
    }

    emit(event, payload) {
        if (this.events[event]) {
            debugLog(`Event emitted: ${event}`, payload);
            for (const fn of this.events[event]) {
                try { fn(payload); }
                catch (err) { console.error('Event handler error:', err); }
            }
        }
    }

    use(middleware) {
        if (middleware.before) this.middlewares.before.push(middleware.before);
        if (middleware.after) this.middlewares.after.push(middleware.after);
        debugLog('Middleware registered:', middleware);
    }

    set(key, value) {
        const oldValue = this.state[key];
        if (oldValue === value) return;

        this._runMiddlewares('before', key, value, oldValue);

        this.state[key] = value;
        debugLog(`State set: ${key} =`, value, '(old:', oldValue, ')');

        if (Array.isArray(value) && !this.computed[key + 'Count']) {
            this.defineComputed(key + 'Count', state => (state.get(key) || []).length);
        }

        if (this.listeners[key]) {
            for (const fn of this.listeners[key]) fn(value, oldValue);
        }
        for (const fn of this.globalListeners) fn(key, value, oldValue);

        if (!this._updatingComputed) {
            this._updatingComputed = true;
            for (const compKey of Object.keys(this.computed)) {
                const newValue = this.computed[compKey].fn(this);
                if (this.state[compKey] !== newValue) {
                    debugLog(`Computed state updated: ${compKey} =`, newValue);
                    this.set(compKey, newValue);
                }
            }
            this._updatingComputed = false;
        }

        this._runMiddlewares('after', key, value, oldValue);
        this.emit('state:change', { key, value, oldValue });
        this.emit(`state:${key}`, { value, oldValue });
    }

    setMany(obj = {}) {
        const entries = Object.entries(obj);
        for (const [key, value] of entries) {
            this.set(key, value);
        }
    }

    get(key, defaultValue = null) {
        const value = this.state[key] !== undefined ? this.state[key] : defaultValue;
        debugLog(`State get: ${key} =`, value);
        return value;
    }

    subscribe(key, fn) {
        if (!key) {
            this.globalListeners.push(fn);
            debugLog('Subscribed to global state');
            return () => this._unsubscribeGlobal(fn);
        } else {
            if (!this.listeners[key]) this.listeners[key] = [];
            this.listeners[key].push(fn);
            debugLog(`Subscribed to state: ${key}`);
            return () => this._unsubscribeKey(key, fn);
        }
    }

    onceSubscribe(key, fn) {
        const unsubscribe = this.subscribe(key, (newVal, oldVal) => {
            fn(newVal, oldVal);
            unsubscribe();
        });
        return unsubscribe;
    }

    defineComputed(key, fn) {
        this.computed[key] = { fn };
        const newValue = fn(this);
        if (this.state[key] !== newValue) this.set(key, newValue);
        debugLog(`Computed state defined: ${key} =`, newValue);
    }

    persist(keys = []) {
        this.use({
            after: (key, value) => {
                if (keys.length === 0 || keys.includes(key)) {
                    try {
                        localStorage.setItem(`USF_${key}`, JSON.stringify(value));
                    } catch (e) {
                        console.error('Persist failed:', e);
                    }
                }
            }
        });

        for (const key of keys) {
            const saved = localStorage.getItem(`USF_${key}`);
            if (saved !== null) {
                try {
                    this.set(key, JSON.parse(saved));
                } catch {
                    debugLog(`Failed to restore state for key: ${key}`);
                }
            }
        }
    }

    reset(key = null) {
        if (key) {
            delete this.state[key];
            delete this.listeners[key];
            debugLog(`State reset: ${key}`);
        } else {
            this.state = {};
            this.listeners = {};
            this.computed = {};
            debugLog('All state reset');
        }
    }

    _unsubscribeGlobal(fn) {
        this.globalListeners = this.globalListeners.filter(f => f !== fn);
        debugLog('Unsubscribed from global state');
    }

    _unsubscribeKey(key, fn) {
        this.listeners[key] = this.listeners[key].filter(f => f !== fn);
        debugLog(`Unsubscribed from state: ${key}`);
    }

    _runMiddlewares(type, key, value, oldValue) {
        for (const fn of this.middlewares[type]) {
            try {
                const res = fn(key, value, oldValue);
                if (res instanceof Promise) res.catch(err => console.error('Middleware error:', err));
            } catch (err) {
                console.error('Middleware error:', err);
            }
        }
    }
}

export const USF = new GlobalState();

export function initState() {
    debugLog('Initializing global state...');

    const username = AppConfig.usf?.username ?? null;

    USF.setMany({
        username,
        loading: false
    });

    USF.persist(['theme']);

    debugLog('Initial state initialized');
}