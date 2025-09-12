import { USF } from '../../app/States.js';
import { ApiService } from '../../services/api.js';

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
				<div class="text-center mb-8">
					<h2 class="text-3xl font-extrabold mb-2">Blog Detail Examples</h2>
				</div>
				<div class="max-w-3xl mx-auto p-5 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
					<h2 class="text-3xl font-bold mb-4 text-center">${post.title}</h2>
					<p class="mb-6 text-justify">${post.body}</p>
					<div class="text-center">
						<a href="#/blog" class="inline-block px-4 py-2 bg-sky-500 text-white rounded shadow hover:bg-sky-600 transition-colors duration-200">
						   Back
						</a>
					</div>
				</div>
			`;
        }
    }

    return `
		<div class="max-w-3xl mx-auto p-6">
			<div class="text-center mb-8">
				<h2 class="text-3xl font-extrabold mb-2">Blog Examples</h2>
				<p class="text-gray-500 text-lg">Total posts: <span class="font-semibold">${postCount}</span></p>
			</div>

			<h3 class="text-2xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Latest Posts:</h3>

			<div class="space-y-6">
				${posts.length > 0 ? posts.map(post => `
					<div class="p-5 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
						<h4 class="text-xl font-semibold mb-2">
							<a href="#/blog/${post.id}" class="hover:text-sky-500 transition-colors duration-200">${post.title}</a>
						</h4>
						<p class="line-clamp-3">${post.body}</p>
						<div class="mt-3 text-sm text-gray-400">ID: ${post.id}</div>
					</div>
				`).join('') : `<p class="text-gray-400 text-center py-4">Loading posts...</p>`}
			</div>
		</div>
	`;
}
