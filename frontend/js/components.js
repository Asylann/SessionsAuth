// components.js - Reusable UI components

// Modal component
function createModal(title, content, onConfirm = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${onConfirm ? '<button class="button button-primary" onclick="confirmModal()">Confirm</button>' : ''}
                <button class="button" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    if (onConfirm) {
        window.confirmModal = () => {
            onConfirm();
            closeModal();
        };
    }

    window.closeModal = () => {
        modal.remove();
        delete window.confirmModal;
        delete window.closeModal;
    };

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    return modal;
}

// Loading spinner component
function createLoadingSpinner(message = 'Loading...') {
    const spinner = document.createElement('div');
    spinner.className = 'loading-container';
    spinner.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    return spinner;
}

// Alert/notification component
function createAlert(message, type = 'info', duration = 3000) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;

    // Add to top of body
    document.body.insertBefore(alert, document.body.firstChild);

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, duration);
    }

    return alert;
}

// Form validation component
function validateForm(formId, validationRules) {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    const errors = [];

    for (const [fieldId, rules] of Object.entries(validationRules)) {
        const field = document.getElementById(fieldId);
        if (!field) continue;

        const value = field.value.trim();

        // Clear previous error styling
        field.classList.remove('error');

        // Check required
        if (rules.required && !value) {
            errors.push(`${rules.label || fieldId} is required`);
            field.classList.add('error');
            isValid = false;
            continue;
        }

        // Check min length
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${rules.label || fieldId} must be at least ${rules.minLength} characters`);
            field.classList.add('error');
            isValid = false;
        }

        // Check max length
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${rules.label || fieldId} must be no more than ${rules.maxLength} characters`);
            field.classList.add('error');
            isValid = false;
        }

        // Check email format
        if (rules.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors.push(`${rules.label || fieldId} must be a valid email`);
                field.classList.add('error');
                isValid = false;
            }
        }

        // Check number format
        if (rules.type === 'number' && value) {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                errors.push(`${rules.label || fieldId} must be a valid number`);
                field.classList.add('error');
                isValid = false;
            } else {
                if (rules.min !== undefined && numValue < rules.min) {
                    errors.push(`${rules.label || fieldId} must be at least ${rules.min}`);
                    field.classList.add('error');
                    isValid = false;
                }
                if (rules.max !== undefined && numValue > rules.max) {
                    errors.push(`${rules.label || fieldId} must be no more than ${rules.max}`);
                    field.classList.add('error');
                    isValid = false;
                }
            }
        }

        // Custom validation
        if (rules.customValidation) {
            const customResult = rules.customValidation(value);
            if (customResult !== true) {
                errors.push(customResult);
                field.classList.add('error');
                isValid = false;
            }
        }
    }

    return { isValid, errors };
}

// Pagination component
function createPagination(currentPage, totalPages, onPageChange) {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    if (totalPages <= 1) return pagination;

    let paginationHTML = '';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">Previous</button>`;
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="pagination-btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">Next</button>`;
    }

    pagination.innerHTML = paginationHTML;

    // Set up page change handler
    window.changePage = (page) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return pagination;
}

// Table component
function createTable(columns, data, actions = null) {
    const table = document.createElement('table');
    table.className = 'table';

    // Create header
    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column.label;
        headerRow.appendChild(th);
    });
    if (actions) {
        const actionTh = document.createElement('th');
        actionTh.textContent = 'Actions';
        headerRow.appendChild(actionTh);
    }

    const thead = document.createElement('thead');
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');

        columns.forEach(column => {
            const td = document.createElement('td');
            let cellContent = row[column.key];

            // Apply formatter if provided
            if (column.formatter) {
                cellContent = column.formatter(cellContent, row);
            }

            td.innerHTML = cellContent;
            tr.appendChild(td);
        });

        // Add actions if provided
        if (actions) {
            const actionTd = document.createElement('td');
            const actionButtons = actions.map(action => {
                return `<button class="button ${action.class || ''}" onclick="${action.onClick}(${row.id || row.index})">${action.label}</button>`;
            }).join(' ');
            actionTd.innerHTML = actionButtons;
            tr.appendChild(actionTd);
        }

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
}

// Card component
function createCard(title, content, actions = null) {
    const card = document.createElement('div');
    card.className = 'card';

    let cardHTML = `
        <div class="card-header">
            <h3>${title}</h3>
        </div>
        <div class="card-body">
            ${content}
        </div>
    `;

    if (actions) {
        cardHTML += `
            <div class="card-footer">
                ${actions.map(action => `<button class="button ${action.class || ''}" onclick="${action.onClick}">${action.label}</button>`).join('')}
            </div>
        `;
    }

    card.innerHTML = cardHTML;
    return card;
}

// Utility function to format currency
function formatCurrency(amount, currency = '₸') {
    return `${parseFloat(amount).toFixed(2)} ${currency}`;
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export functions for global use
window.Components = {
    createModal,
    createLoadingSpinner,
    createAlert,
    validateForm,
    createPagination,
    createTable,
    createCard,
    formatCurrency,
    formatDate
};