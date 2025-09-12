import { USF } from '../../app/States.js';
import { ApiService } from '../../services/api.js';
import { HelloButton } from '../components/button.js';

export function Blog(params = {}) {
    const username = USF.get('username', 'Guest');
    const posts = USF.get('posts', []);
    const postCount = USF.get('postsCount', 0);

    USF.subscribe('posts', () => window.router.handleRoute());

    if (!posts.length) {
        ApiService.get('https://jsonplaceholder.typicode.com/posts?_limit=5')
            .then(data => USF.set('posts', data || []))
            .catch(err => console.error('Failed to fetch posts:', err));
    }

    if (params.id) {
        const post = posts.find(p => String(p.id) === params.id);
        if (post) {
            return `
            <div class="text-center">
                <h2 class="text-2xl font-semibold mb-4">${post.title}</h2>
                <p class="text-gray-700 mb-4">${post.body}</p>
                <a href="#/blog" class="text-blue-500 hover:underline">Back</a>
            </div>`;
        }
    }

    return `
    <div class="text-center">
        <h2 class="text-2xl font-semibold mb-4">Welcome, ${username}</h2>
        <p>Total posts: ${postCount}</p>
        ${HelloButton()}
        <h3 class="mt-6 text-xl font-bold">Latest Posts:</h3>
        <div class="mt-2 max-w-xl mx-auto space-y-4 text-left">
            ${posts.length > 0 ? posts.map(post => `
                <div class="p-4 bg-gray-100 rounded shadow">
                    <h4 class="font-bold mb-1">
                        <a href="#/blog/${post.id}" class="hover:underline">${post.title}</a>
                    </h4>
                    <p class="text-gray-700">${post.body}</p>
                </div>`).join('') : `<p class="text-gray-500">Loading posts...</p>`}
        </div>
    </div>`;
}
