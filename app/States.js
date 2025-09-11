import { debugLog } from '../utils/debug.js';

class GlobalState {
    constructor() {
        this.state = {};
        this.listeners = {};
        this.globalListeners = [];
        this.computed = {};
        this.middlewares = { before: [], after: [] };
        this._updatingComputed = false;
    }

    use(middleware) {
        if (middleware.before) this.middlewares.before.push(middleware.before);
        if (middleware.after) this.middlewares.after.push(middleware.after);
        debugLog('Middleware registered:', middleware);
    }

    set(key, value) {
        const oldValue = this.state[key];
        this.middlewares.before.forEach(fn => fn(key, value, oldValue));

        this.state[key] = value;
        debugLog(`State set: ${key} =`, value, '(old:', oldValue, ')');

        if (this.listeners[key]) this.listeners[key].forEach(fn => fn(value, oldValue));
        this.globalListeners.forEach(fn => fn(key, value, oldValue));

        if (!this._updatingComputed) {
            this._updatingComputed = true;
            for (const compKey in this.computed) {
                const newValue = this.computed[compKey].fn(this);
                if (this.state[compKey] !== newValue) {
                    debugLog(`Computed state updated: ${compKey} =`, newValue);
                    this.set(compKey, newValue);
                }
            }
            this._updatingComputed = false;
        }

        this.middlewares.after.forEach(fn => fn(key, value, oldValue));
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
            return () => { 
                this.globalListeners = this.globalListeners.filter(f => f !== fn); 
                debugLog('Unsubscribed from global state');
            };
        } else {
            if (!this.listeners[key]) this.listeners[key] = [];
            this.listeners[key].push(fn);
            debugLog(`Subscribed to state: ${key}`);
            return () => { 
                this.listeners[key] = this.listeners[key].filter(f => f !== fn); 
                debugLog(`Unsubscribed from state: ${key}`);
            };
        }
    }

    defineComputed(key, fn) {
        this.computed[key] = { fn };
        const newValue = fn(this);
        if (this.state[key] !== newValue) this.set(key, newValue);
        debugLog(`Computed state defined: ${key} =`, newValue);
    }
}

export const USF = new GlobalState();

export function initState() {
    debugLog('Initializing global state...');
    USF.set('username', 'NovaUser');
    USF.set('loading', false);
    USF.defineComputed('postCount', state => (state.get('posts') || []).length);
    debugLog('Initial state initialized');
}
