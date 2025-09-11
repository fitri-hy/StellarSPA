import { USF } from './States.js';
import { routes } from '../routes/web.js';
import { MainLayout } from '../../views/layouts/MainLayout.js';
import { NotFound, InternalError } from '../views/pages/error.js';
import { DynamicHead } from '../views/partials/head.js';
import { debugLog, debugWarn, debugError } from '../utils/debug.js';

class Router {
    constructor() {
        this.routes = [];
        this.unsubscribeFns = [];
        this.errorHandler = null;

        window.addEventListener('hashchange', () => {
            debugLog('Hash changed, handling route...');
            this.handleRoute();
        });
    }

    register(route) {
        this.routes.push(route);
        debugLog('Route registered:', route.path);
    }

    navigate(path) {
        debugLog('Navigating to:', path);
        if (window.location.hash.slice(1) !== path) window.location.hash = path;
        else this.handleRoute();
    }

    parsePath(routePath, actualPath) {
        const routeParts = routePath.split('/').filter(Boolean);
        const pathParts = actualPath.split('/').filter(Boolean);
        if (routeParts.length !== pathParts.length) return null;

        const params = {};
        for (let i = 0; i < routeParts.length; i++) {
            const part = routeParts[i];
            if (part.startsWith(':')) params[part.slice(1)] = pathParts[i];
            else if (part !== pathParts[i]) return null;
        }
        return params;
    }

    htmlToNodes(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return Array.from(template.content.childNodes);
    }

    render(route, params) {
        const app = document.getElementById('app');
        if (!app) return;

        try {
            let headProps = route.headProps;
            if (typeof headProps === 'function') headProps = headProps(params);
            if (headProps) {
                DynamicHead(headProps);
                debugLog('Head updated:', headProps);
            }

            let content = route.component(params);
            if (route.layout) content = route.layout(content);
            app.replaceChildren(...this.htmlToNodes(content));

            debugLog(`Rendered route: ${route.path}`, params);
        } catch (error) {
            debugError('Rendering error:', error);
            if (this.errorHandler) {
                const content = this.errorHandler(error);
                app.replaceChildren(...this.htmlToNodes(content));
            } else {
                const content = MainLayout(InternalError(error));
                app.replaceChildren(...this.htmlToNodes(content));
            }
        }
    }

    handleRoute() {
        const path = window.location.hash.slice(1) || '/';
        debugLog('Handling route for path:', path);

        let matchedRoute = null;
        let params = {};

        for (const route of this.routes) {
            const p = this.parsePath(route.path, path);
            if (p !== null) {
                matchedRoute = route;
                params = p;
                break;
            }
        }

        if (!matchedRoute) {
            matchedRoute = { component: NotFound, layout: MainLayout, headProps: { title: '404 Not Found' } };
            params = {};
            debugWarn('No matching route found. Using 404.');
        }

        window.currentRouteParams = params;

        this.unsubscribeFns.forEach(fn => fn?.());
        this.unsubscribeFns = [];

        if (matchedRoute.stateKeys) {
            matchedRoute.stateKeys.forEach(key => {
                const unsub = USF.subscribe(key, () => this.render(matchedRoute, params));
                if (typeof unsub === 'function') this.unsubscribeFns.push(unsub);
                debugLog(`Subscribed to state key: ${key}`);
            });
        }

        this.render(matchedRoute, params);
    }

    setErrorHandler(handler) {
        this.errorHandler = handler;
        debugLog('Custom error handler set');
    }
}

export const NOVARouter = new Router();

export function initRouter() {
    routes.forEach(route => NOVARouter.register(route));
    NOVARouter.setErrorHandler(error => MainLayout(InternalError(error)));
    NOVARouter.handleRoute();
    window.router = NOVARouter;
    debugLog('Router initialized');
}