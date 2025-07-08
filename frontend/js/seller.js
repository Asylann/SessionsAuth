// Seller panel functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and role
    if (!utils.checkAuth()) return;
    if (!utils.checkRole(2, 3)) return; // Seller or Admin

    loadSellerPanel();
    setupEventListeners();
});

function loadSellerPanel() {
    loadCategories();
    loadSellerProducts();
}

function setupEventListeners() {
    // Add product form
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
}

async function loadCategories() {
    try {
        const response = await api.categories.getAll();
        const categorySelect = document.getElementById('product-category');

        if (response.data && categorySelect) {
            categorySelect.innerHTML = '<option value="">-- Select Category --</option>';

            response.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        utils.handleError(error, 'Failed to load categories');
    }
}

async function loadSellerProducts() {
    try {
        const currentUser = utils.session.getCurrentUser();
        const response = await api.products.getBySeller(currentUser.id);
        const productList = document.getElementById('seller-product-list');

        if (!productList) return;

        productList.innerHTML = '';

        if (response.data && response.data.length > 0) {
            response.data.forEach(product => {
                const productCard = createProductCard(product);
                productList.appendChild(productCard);
            });
        } else {
            productList.innerHTML = '<p>You haven\'t added any products yet.</p>';
        }
    } catch (error) {
        utils.handleError(error, 'Failed to load your products');
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        ${product.imageURL ? `<img src="${product.imageURL}" alt="${product.name}" />` : '<div class="placeholder-image">No Image</div>'}
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="description">${product.description}</p>
            <div class="price">${utils.formatPrice(product.price)}</div>
            <div class="product-meta">
                <span class="size">Size: ${product.size}</span>
            </div>
            <div class="product-actions">
                <button onclick="editProduct(${product.id})" class="btn-edit">Edit</button>
                <button onclick="deleteProduct(${product.id})" class="btn-delete">Delete</button>
            </div>
        </div>
    `;
    return card;
}

async function handleAddProduct(e) {
    e.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const size = parseFloat(document.getElementById('product-size').value) || 0;
    const imageURL = document.getElementById('product-image').value.trim();
    const categoryId = parseInt(document.getElementById('product-category').value);

    // Validation
    if (!name) {
        utils.showAlert('Product name is required', 'error');
        return;
    }

    if (!description) {
        utils.showAlert('Product description is required', 'error');
        return;
    }

    if (!price || price <= 0) {
        utils.showAlert('Please enter a valid price', 'error');
        return;
    }

    if (!categoryId) {
        utils.showAlert('Please select a category', 'error');
        return;
    }

    const currentUser = utils.session.getCurrentUser();
    const productData = {
        name,
        description,
        price,
        size,
        imageURL: imageURL || '',
        category_id: categoryId,
        seller_id: parseInt(currentUser.id)
    };

    try {
        const response = await api.products.create(productData);

        if (response.data) {
            utils.showAlert('Product added successfully!', 'success');
            e.target.reset();
            loadSellerProducts();
        }
    } catch (error) {
        utils.handleError(error, 'Failed to add product');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        await api.products.delete(productId);
        utils.showAlert('Product deleted successfully!', 'success');
        loadSellerProducts();
    } catch (error) {
        utils.handleError(error, 'Failed to delete product');
    }
}

function editProduct(productId) {
    // For now, just show an alert. You can implement a modal or redirect to edit page
    utils.showAlert('Edit functionality coming soon!', 'info');
    // TODO: Implement edit functionality
}

// Global logout function
function logout() {
    utils.logout();
}