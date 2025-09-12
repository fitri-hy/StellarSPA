// product.js
import { USF } from '../../app/States.js';
import { ApiService } from '../../services/api.js';
import { HelloButton } from '../components/button.js';

export function Product(params = {}) {
    const username = USF.get('username', 'Guest');
    const products = USF.get('products', []);

    // Subscribe untuk perubahan state
    USF.subscribe('products', () => window.router.handleRoute());

    // Fetch data jika belum ada
    if (!products.length) {
        ApiService.get('https://fakestoreapi.com/products?limit=5')
            .then(data => USF.set('products', data || []))
            .catch(err => console.error('Failed to fetch products:', err));
    }

    // Detail view
    if (params.id) {
        const product = products.find(p => String(p.id) === params.id);
        if (product) {
            return `
            <div class="text-center">
                <h2 class="text-2xl font-semibold mb-4">${product.title}</h2>
                <img src="${product.image}" alt="${product.title}" class="mx-auto mb-4 w-40">
                <p class="text-gray-700 mb-2">Price: $${product.price}</p>
                <p class="text-gray-700 mb-4">${product.description}</p>
                <a href="#/products" class="text-blue-500 hover:underline">Back</a>
            </div>`;
        }
    }

    // List view
    return `
    <div class="text-center">
        <h2 class="text-2xl font-semibold mb-4">Welcome, ${username}</h2>
        ${HelloButton()}
        <button onclick="addProduct()" class="bg-green-500 text-white px-3 py-1 rounded mb-4">Add Product</button>
        <h3 class="mt-6 text-xl font-bold">Products:</h3>
        <div class="mt-2 max-w-xl mx-auto space-y-4 text-left">
            ${products.length > 0 ? products.map(product => `
                <div class="p-4 bg-gray-100 rounded shadow flex justify-between items-center">
                    <div>
                        <h4 class="font-bold mb-1">
                            <a href="#/products/${product.id}" class="hover:underline">${product.title}</a>
                        </h4>
                        <p class="text-gray-700">$${product.price}</p>
                    </div>
                    <div class="space-x-2">
                        <button onclick="editProduct(${product.id})" class="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                        <button onclick="deleteProduct(${product.id})" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                    </div>
                </div>`).join('') : `<p class="text-gray-500">Loading products...</p>`}
        </div>
    </div>`;
}

// ------------------- CRUD Functions -------------------

window.addProduct = function() {
    const title = prompt("Product title:");
    const price = parseFloat(prompt("Product price:"));
    const description = prompt("Product description:");
    const image = prompt("Product image URL:");
    if (title && !isNaN(price)) {
        ApiService.post('https://fakestoreapi.com/products', { title, price, description, image })
            .then(newProduct => {
                USF.set('products', [...USF.get('products'), newProduct]);
            })
            .catch(err => console.error("Failed to add product:", err));
    }
};

window.editProduct = function(id) {
    const product = USF.get('products').find(p => p.id === id);
    const newTitle = prompt("Edit product title:", product.title);
    if (newTitle) {
        ApiService.put(`https://fakestoreapi.com/products/${id}`, { title: newTitle })
            .then(updated => {
                const updatedProducts = USF.get('products').map(p => p.id === id ? updated : p);
                USF.set('products', updatedProducts);
            })
            .catch(err => console.error("Failed to edit product:", err));
    }
};

window.deleteProduct = function(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        ApiService.delete(`https://fakestoreapi.com/products/${id}`)
            .then(() => {
                const filtered = USF.get('products').filter(p => p.id !== id);
                USF.set('products', filtered);
            })
            .catch(err => console.error("Failed to delete product:", err));
    }
};
