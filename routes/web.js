import { USF } from '../../app/States.js';
import { MainLayout } from '../../views/layouts/MainLayout.js';
import { Landing } from '../views/pages/landing.js';
import { Blog } from '../views/pages/blog.js';
import { NotFound } from '../views/pages/error.js';
import { debugLog } from '../../utils/debug.js';

export const routes = [
    { 
        path: '/', 
        component: Landing, 
        layout: MainLayout, 
        stateKeys: ['visits', 'username'],
        headProps: { 
            title: 'Landing Page', 
            description: 'Welcome to Stellar App' 
        },
        onAccess: () => debugLog('Accessed route: /') 
    },
    { 
        path: '/blog', 
        component: Blog, 
        layout: MainLayout, 
        stateKeys: ['posts'],
        headProps: { 
            title: 'Blog', 
            description: 'Blog Stellar App' 
        },
        onAccess: () => debugLog('Accessed route: /blog') 
    },
    { 
        path: '/blog/:id', 
        component: Blog, 
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
                    title: `Blog ${params.id}`, 
                    description: `Detail for post ${params.id}` 
                };
            }

            debugLog(`Computed headProps for /blog/${params.id}:`, head);
            return head;
        },
        onAccess: (params) => debugLog('Accessed route: /blog/:id', params) 
    },
    { 
        path: '*', 
        component: NotFound, 
        layout: MainLayout, 
        stateKeys: ['lastError'],
        headProps: { 
            title: '404 Not Found', 
            description: 'Page not found' 
        },
        onAccess: () => debugLog('Accessed route: 404 Not Found') 
    }
];
