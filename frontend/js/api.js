// API base URL
const API_BASE_URL = 'http://localhost:8080';

// API helper functions
const api = {
    // Make authenticated requests
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            credentials: 'include', // Include cookies for session-based auth
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // Authentication endpoints
    auth: {
        async login(email, password) {
            return api.request('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
        },

        async signup(email, password, roleId) {
            return api.request('/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    roleId: parseInt(roleId)
                })
            });
        },

        async logout() {
            return api.request('/logout', {
                method: 'POST'
            });
        }
    },

    // Products endpoints
    products: {
        async getAll() {
            return api.request('/products');
        },

        async getById(id) {
            return api.request(`/products/${id}`);
        },

        async getByCategory(categoryId) {
            return api.request(`/productsByCategory/${categoryId}`);
        },

        async getBySeller(sellerId) {
            return api.request(`/productsBySeller/${sellerId}`);
        },

        async create(productData) {
            return api.request('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        },

        async update(id, productData) {
            return api.request(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        },

        async delete(id) {
            return api.request(`/products/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Categories endpoints
    categories: {
        async getAll() {
            return api.request('/categories');
        },

        async getById(id) {
            return api.request(`/categories/${id}`);
        },

        async create(categoryData) {
            return api.request('/categories', {
                method: 'POST',
                body: JSON.stringify(categoryData)
            });
        },

        async update(id, categoryData) {
            return api.request(`/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify(categoryData)
            });
        },

        async delete(id) {
            return api.request(`/categories/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Users endpoints
    users: {
        async getAll() {
            return api.request('/users');
        },

        async getById(id) {
            return api.request(`/users/${id}`);
        },

        async getEmail(id) {
            return api.request(`/users/email/${id}`);
        },

        async update(id, userData) {
            return api.request(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        },

        async delete(id) {
            return api.request(`/users/${id}`, {
                method: 'DELETE'
            });
        }
    }
};