// main.js - Main application entry point and global functionality

// Global application state
const App = {
    currentUser: null,
    config: {
        apiBaseUrl: 'http://localhost:8080',
        timeout: 5000,
        retryAttempts: 3
    },
    cache: new Map(),
    eventListeners: new Map()
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Set up global error handler
    window.addEventListener('error', handleGlobalError);

    // Set up unhandled promise rejection handler
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Check if user is authenticated
    checkAuthenticationStatus();

    // Initialize page-specific functionality
    initializePageSpecificFeatures();

    // Set up periodic session validation
    setInterval(validateSession, 5 * 60 * 1000); // Check every 5 minutes
}

function checkAuthenticationStatus() {
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['index.html', 'signup.html', ''];

    if (publicPages.includes(currentPage)) {
        // Check if user is already logged in and redirect to dashboard
        if (localStorage.getItem('isLoggedIn') === 'true') {
            window.location.href = 'pages/dashboard.html';
        }
    } else {
        // Protected page - check authentication
        if (!utils.checkAuth()) {
            window.location.href = '../index.html';
        }
    }
}

function initializePageSpecificFeatures() {
    const currentPage = window.location.pathname.split('/').pop();

    switch (currentPage) {
        case 'dashboard.html':
            initializeDashboard();
            break;
        case 'products.html':
            initializeProductsPage();
            break;
        case 'admin.html':
            initializeAdminPage();
            break;
        case 'seller.html':
            initializeSellerPage();
            break;
        case 'product-detail.html':
            initializeProductDetail();
            break;
        default:
            initializeHomePage();
    }
}

function initializeDashboard() {
    // Dashboard-specific initialization
    if (typeof loadDashboard === 'function') {
        loadDashboard();
    }
}

function initializeProductsPage() {
    // Products page-specific initialization
    setupProductFilters();
    setupProductSearch();
}

function initializeAdminPage() {
    // Admin page-specific initialization
    if (typeof loadCategories === 'function') {
        loadCategories();
    }
    if (typeof loadProducts === 'function') {
        loadProducts();
    }
    if (typeof loadUsers === 'function') {
        loadUsers();
    }
}

function initializeSellerPage() {
    // Seller page-specific initialization
    if (typeof loadSellerProducts === 'function') {
        loadSellerProducts();
    }
}

function initializeProductDetail() {
    // Product detail page-specific initialization
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId && typeof loadProductDetail === 'function') {
        loadProductDetail(productId);
    }
}

function initializeHomePage() {
    // Home page initialization
    setupLoginForm();
    setupNavigationLinks();
}

// Enhanced search functionality
function setupProductSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, 300);
        });
    }
}

function performSearch(query) {
    if (!query.trim()) {
        if (typeof fetchProducts === 'function') {
            fetchProducts();
        }
        return;
    }

    const cachedResults = App.cache.get(`search:${query}`);
    if (cachedResults) {
        displaySearchResults(cachedResults);
        return;
    }

    fetch(`${App.config.apiBaseUrl}/products/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            App.cache.set(`search:${query}`, data);
            displaySearchResults(data);
        })
        .catch(error => {
            console.error('Search error:', error);
            utils.showAlert('Search failed. Please try again.', 'error');
        });
}

function displaySearchResults(data) {
    if (typeof displayProducts === 'function') {
        displayProducts(data, 'Search Results');
    }
}

// Enhanced filtering system
function setupProductFilters() {
    const filters = document.querySelectorAll('.filter-control');

    filters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const filters = {
        category: document.getElementById('product-category')?.value,
        minPrice: document.getElementById('min-price')?.value,
        maxPrice: document.getElementById('max-price')?.value,
        sortBy: document.getElementById('sort-by')?.value
    };

    const validFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== undefined && value !== '')
    );

    if (Object.keys(validFilters).length === 0) {
        if (typeof fetchProducts === 'function') {
            fetchProducts();
        }
        return;
    }

    const queryString = new URLSearchParams(validFilters).toString();

    fetch(`${App.config.apiBaseUrl}/products/filter?${queryString}`, {
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (typeof displayProducts === 'function') {
                displayProducts(data, 'Filtered Products');
            }
        })
        .catch(error => {
            console.error('Filter error:', error);
            utils.showAlert('Filter failed. Please try again.', 'error');
        });
}

// Session validation
function validateSession() {
    if (!localStorage.getItem('isLoggedIn')) {
        return;
    }

    fetch(`${App.config.apiBaseUrl}/auth/validate`, {
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Session invalid');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Session validation failed:', error);
            handleSessionExpiry();
        });
}

function handleSessionExpiry() {
    localStorage.clear();
    utils.showAlert('Your session has expired. Please log in again.', 'warning');

    setTimeout(() => {
        window.location.href = '../index.html';
    }, 3000);
}

// Enhanced error handling
function handleGlobalError(event) {
    console.error('Global error:', event.error);

    // Don't show error alerts for network errors or expected errors
    if (event.error.message.includes('Network') ||
        event.error.message.includes('fetch')) {
        return;
    }

    utils.showAlert('An unexpected error occurred. Please try again.', 'error');
}

function handleUnhandledRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);

    // Prevent default browser behavior
    event.preventDefault();

    // Show user-friendly error message
    utils.showAlert('Something went wrong. Please try again.', 'error');
}

// Enhanced API request wrapper with retry logic
function makeAPIRequest(url, options = {}) {
    const config = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    return retryRequest(url, config, App.config.retryAttempts);
}

function retryRequest(url, config, retries) {
    return fetch(url, config)
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    handleSessionExpiry();
                    throw new Error('Authentication required');
                }
                throw new Error(`HTTP ${response.status}`);
            }
            return response;
        })
        .catch(error => {
            if (retries > 0 && !error.message.includes('Authentication')) {
                console.log(`Retrying request to ${url}. Attempts left: ${retries}`);
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(retryRequest(url, config, retries - 1));
                    }, 1000);
                });
            }
            throw error;
        });
}

// Utility functions for common operations
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Navigation helpers
function setupNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');

            // Add loading state
            link.style.opacity = '0.5';
            link.style.pointerEvents = 'none';

            // Navigate with a slight delay for visual feedback
            setTimeout(() => {
                window.location.href = href;
            }, 100);
        });
    });
}

// Form helpers
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const credentials = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            if (typeof handleLogin === 'function') {
                handleLogin(credentials);
            }
        });
    }
}

// Export for global use
window.App = App;
window.makeAPIRequest = makeAPIRequest;
window.debounce = debounce;
window.throttle = throttle;