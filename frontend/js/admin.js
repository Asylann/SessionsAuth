// admin.js - Admin Panel functionality

document.addEventListener("DOMContentLoaded", () => {
    // Check authentication and role
    if (!utils.checkAuth()) return;
    if (!utils.checkRole(3)) return; // Only admins (role 3)

    loadCategories();
    loadProducts();
    loadUsers();

    // Set up form handler
    document.getElementById('createProductForm').addEventListener('submit', handleCreateProduct);
});

function loadCategories() {
    fetch('http://localhost:8080/categories', {
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('category');
            if (data.data) {
                data.data.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    select.appendChild(option);
                });
            }
        })
        .catch(err => {
            console.error('Error loading categories:', err);
            utils.showAlert('Error loading categories', 'error');
        });
}

function loadUsers() {
    fetch('http://localhost:8080/users', {
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('usersList');
            container.innerHTML = '';

            if (data.data && data.data.length > 0) {
                const table = document.createElement('table');
                table.className = 'table';
                table.innerHTML = `
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.data.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.email}</td>
                            <td>
                                <span class="badge ${getBadgeClass(user.roleId)}">
                                    ${getRoleName(user.roleId)}
                                </span>
                            </td>
                            <td>
                                <button onclick="deleteUser(${user.id})" class="button-danger">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
                container.appendChild(table);
            } else {
                container.innerHTML = '<p>No users found.</p>';
            }
        })
        .catch(err => {
            console.error('Error loading users:', err);
            document.getElementById('usersList').innerHTML = '<p>Error loading users.</p>';
        });
}

function loadProducts() {
    fetch('http://localhost:8080/products', {
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('productsList');
            list.innerHTML = '';

            if (data.data) {
                const products = Array.isArray(data.data) ? data.data : Object.values(data.data);
                products.forEach(p => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                    ${p.imageURL ? `<img src="${p.imageURL}" alt="${p.name}" />` : ''}
                    <div class="info">
                        <h3>${p.name}</h3>
                        <p>${p.description}</p>
                        <div class="price">${p.price} ₸</div>
                        <button onclick="deleteProduct(${p.id})" class="button-danger">Delete</button>
                    </div>
                `;
                    list.appendChild(card);
                });
            } else {
                list.innerHTML = '<p>No products found.</p>';
            }
        })
        .catch(err => {
            console.error('Error loading products:', err);
            utils.showAlert('Error loading products', 'error');
        });
}

function handleCreateProduct(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const description = document.getElementById('description').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const categoryId = parseInt(document.getElementById('category').value);
    const imageURL = document.getElementById('imageURL').value.trim();
    const size = parseFloat(document.getElementById('size').value);

    // Get current user ID from session storage or make a request to get it
    const userId = parseInt(localStorage.getItem("userId") || "1", 10);

    const payload = {
        name,
        description,
        price,
        size: size || 0,
        category_id: categoryId,
        imageURL: imageURL || "",
        seller_id: userId
    };

    fetch('http://localhost:8080/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                utils.showAlert(data.error, 'error');
            } else {
                utils.showAlert('Product created successfully!');
                document.getElementById('createProductForm').reset();
                loadProducts();
            }
        })
        .catch(err => {
            console.error('Error creating product:', err);
            utils.showAlert('Error creating product', 'error');
        });
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    fetch(`http://localhost:8080/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            utils.showAlert('Product deleted successfully!');
            loadProducts();
        })
        .catch(err => {
            console.error('Error deleting product:', err);
            utils.showAlert('Error deleting product', 'error');
        });
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    fetch(`http://localhost:8080/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            utils.showAlert('User deleted successfully!');
            loadUsers(); // Reload users, not products
        })
        .catch(err => {
            console.error('Error deleting user:', err);
            utils.showAlert('Error deleting user', 'error');
        });
}

function getRoleName(roleId) {
    switch (roleId) {
        case 1:
        case '1':
            return 'Customer';
        case 2:
        case '2':
            return 'Seller';
        case 3:
        case '3':
            return 'Admin';
        default:
            return 'Unknown';
    }
}

function getBadgeClass(roleId) {
    switch (roleId) {
        case 1:
        case '1':
            return 'badge-customer';
        case 2:
        case '2':
            return 'badge-seller';
        case 3:
        case '3':
            return 'badge-admin';
        default:
            return '';
    }
}

function logout() {
    fetch('http://localhost:8080/logout', {
        method: 'POST',
        credentials: 'include'
    })
        .then(() => {
            localStorage.clear();
            window.location.href = '../index.html';
        })
        .catch(err => {
            console.error('Logout error:', err);
            // Force logout on client side even if server request fails
            localStorage.clear();
            window.location.href = '../index.html';
        });
}