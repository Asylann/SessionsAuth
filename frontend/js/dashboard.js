// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!utils.checkAuth()) {
        return;
    }

    loadDashboard();
    setupEventListeners();
});

function loadDashboard() {
    const currentUser = utils.session.getCurrentUser();

    // Update dashboard content
    updateDashboardContent(currentUser);

    // Show/hide navigation based on role
    updateNavigationByRole(currentUser.role);

    // Update system status
    updateSystemStatus(currentUser);
}

function updateDashboardContent(user) {
    const dashboardCard = document.querySelector('.dashboard-card');
    if (dashboardCard) {
        const content = dashboardCard.querySelector('p');
        if (content) {
            content.innerHTML = `
                <div class="user-info">
                    <h3>Welcome back!</h3>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Role:</strong> ${utils.getRoleName(user.role)}</p>
                    <p><strong>User ID:</strong> ${user.id}</p>
                </div>
            `;
        }
    }
}

function updateNavigationByRole(roleId) {
    const navProducts = document.getElementById('nav-products');
    const navSeller = document.getElementById('nav-seller');
    const navAdmin = document.getElementById('nav-admin');

    const sellerBtn = document.getElementById('seller-actions-btn');
    const adminBtn = document.getElementById('admin-actions-btn');

    // Show navigation based on role
    if (roleId >= 1) { // Customer, Seller, Admin can view products
        if (navProducts) navProducts.style.display = 'inline-block';
    }

    if (roleId >= 2) { // Seller and Admin can manage products
        if (navSeller) navSeller.style.display = 'inline-block';
        if (sellerBtn) sellerBtn.style.display = 'inline-block';
    }

    if (roleId >= 3) { // Only Admin can access admin panel
        if (navAdmin) navAdmin.style.display = 'inline-block';
        if (adminBtn) adminBtn.style.display = 'inline-block';
    }
}

function updateSystemStatus(user) {
    const userStatus = document.getElementById('user-status');
    if (userStatus) {
        userStatus.textContent = `👤 Logged in as ${utils.getRoleName(user.role)}`;
    }
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Quick action buttons
    const viewProductsBtn = document.getElementById('view-products-btn');
    if (viewProductsBtn) {
        viewProductsBtn.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }

    const sellerActionsBtn = document.getElementById('seller-actions-btn');
    if (sellerActionsBtn) {
        sellerActionsBtn.addEventListener('click', () => {
            window.location.href = 'seller.html';
        });
    }

    const adminActionsBtn = document.getElementById('admin-actions-btn');
    if (adminActionsBtn) {
        adminActionsBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }
}

async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await utils.logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if server request fails
            utils.session.clear();
            window.location.href = '../index.html';
        }
    }
}

// Global logout function for header buttons
function logout() {
    handleLogout();
}