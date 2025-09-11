import { USF } from '../../app/States.js';
import { MainLayout } from '../../views/layouts/MainLayout.js';
import { Landing } from '../views/pages/landing.js';
import { Dashboard } from '../views/pages/dashboard.js';
import { NotFound } from '../views/pages/error.js';
import { debugLog } from '../../utils/debug.js';

export const routes = [
    { 
        path: '/', 
        component: Landing, 
        layout: MainLayout, 
        headProps: { 
            title: 'Landing Page', 
            description: 'Welcome to NOVA App' 
        },
        onAccess: () => debugLog('Accessed route: /') 
    },
    { 
        path: '/dashboard', 
        component: Dashboard, 
        layout: MainLayout, 
        stateKeys: ['posts'],
        headProps: { 
            title: 'Dashboard', 
            description: 'Dashboard NOVA App' 
        },
        onAccess: () => debugLog('Accessed route: /dashboard') 
    },
    { 
        path: '/dashboard/:id', 
        component: Dashboard, 
        layout: MainLayout, 
        stateKeys: ['posts'],
        headProps: (params) => {
            const posts = USF.get('posts', []);
            let head;

            if(params.id){
                const post = posts.find(p => String(p.id) === params.id);
                if(post){
                    head = { 
                        title: post.title, 
                        description: post.body 
                    };
                }
            }

            if(!head){
                head = { 
                    title: `Dashboard ${params.id}`, 
                    description: `Detail for post ${params.id}` 
                };
            }

            debugLog(`Computed headProps for /dashboard/${params.id}:`, head);
            return head;
        },
        onAccess: (params) => debugLog('Accessed route: /dashboard/:id', params) 
    },
    { 
        path: '*', 
        component: NotFound, 
        layout: MainLayout, 
        headProps: { 
            title: '404 Not Found', 
            description: 'Page not found' 
        },
        onAccess: () => debugLog('Accessed route: 404 Not Found') 
    }
];
