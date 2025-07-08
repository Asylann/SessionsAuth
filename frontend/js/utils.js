// Utility functions for the application
const utils = {
    // Session management
    session: {
        get(key) {
            return sessionStorage.getItem(key);
        },

        set(key, value) {
            sessionStorage.setItem(key, value);
        },

        remove(key) {
            sessionStorage.removeItem(key);
        },

        clear() {
            sessionStorage.clear();
        },

        // Check if user is authenticated
        isAuthenticated() {
            return this.get('userId') !== null && this.get('userRole') !== null;
        },

        // Get current user info
        getCurrentUser() {
            return {
                id: this.get('userId'),
                email: this.get('userEmail'),
                role: parseInt(this.get('userRole'))
            };
        },

        // Set user session data
        setUserSession(userId, email, roleId) {
            this.set('userId', userId);
            this.set('userEmail', email);
            this.set('userRole', roleId);
        }
    },

    // Authentication checks
    checkAuth() {
        if (!this.session.isAuthenticated()) {
            this.showAlert('Please log in to access this page', 'error');
            window.location.href = '../index.html';
            return false;
        }
        return true;
    },

    // Role-based access control
    checkRole(...allowedRoles) {
        const userRole = parseInt(this.session.get('userRole'));
        if (!allowedRoles.includes(userRole)) {
            this.showAlert('You do not have permission to access this page', 'error');
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    },

    // Alert system
    showAlert(message, type = 'success') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="alert-close">&times;</button>
        `;

        // Add to page
        document.body.insertBefore(alert, document.body.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    },

    // Form validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePassword(password) {
        return password.length >= 6;
    },

    // Format price with currency
    formatPrice(price) {
        return `${parseFloat(price).toFixed(2)} ₸`;
    },

    // Format date
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    },

    // Role name mapping
    getRoleName(roleId) {
        const roles = {
            1: 'Customer',
            2: 'Seller',
            3: 'Admin'
        };
        return roles[roleId] || 'Unknown';
    },

    // Role badge class mapping
    getRoleBadgeClass(roleId) {
        const classes = {
            1: 'badge-customer',
            2: 'badge-seller',
            3: 'badge-admin'
        };
        return classes[roleId] || '';
    },

    // Loading indicator
    showLoading(element) {
        element.innerHTML = '<div class="loading-spinner"></div><p>Loading...</p>';
    },

    hideLoading(element) {
        element.innerHTML = '';
    },

    // Error handling
    handleError(error, fallbackMessage = 'An error occurred') {
        console.error(error);
        const message = error.message || fallbackMessage;
        this.showAlert(message, 'error');
    },

    // Logout function
    async logout() {
        try {
            await api.auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.session.clear();
            window.location.href = '../index.html';
        }
    },

    // Redirect based on role
    redirectByRole(roleId) {
        switch (parseInt(roleId)) {
            case 1: // Customer
                window.location.href = 'products.html';
                break;
            case 2: // Seller
                window.location.href = 'seller.html';
                break;
            case 3: // Admin
                window.location.href = 'admin.html';
                break;
            default:
                window.location.href = 'dashboard.html';
        }
    },

    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};