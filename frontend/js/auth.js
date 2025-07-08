// Authentication handling
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (utils.session.isAuthenticated()) {
        window.location.href = 'pages/dashboard.html';
        return;
    }

    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form handler
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('error-message');

    // Clear previous error
    errorElement.style.display = 'none';

    // Validation
    if (!utils.validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (!utils.validatePassword(password)) {
        showError('Password must be at least 6 characters long');
        return;
    }

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;

    try {
        const response = await api.auth.login(email, password);

        if (response.data) {
            // Store user session data
            utils.session.setUserSession(
                response.data.id,
                response.data.email,
                response.data.roleId
            );

            utils.showAlert('Login successful! Redirecting...', 'success');

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'pages/dashboard.html';
            }, 1000);
        } else {
            throw new Error('Invalid login response');
        }
    } catch (error) {
        showError(error.message || 'Login failed. Please try again.');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();

    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const roleId = document.getElementById('signup-role').value;
    const errorElement = document.getElementById('error-message');

    // Clear previous error
    errorElement.style.display = 'none';

    // Validation
    if (!utils.validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (!utils.validatePassword(password)) {
        showError('Password must be at least 6 characters long');
        return;
    }

    if (!roleId) {
        showError('Please select a role');
        return;
    }

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating account...';
    submitButton.disabled = true;

    try {
        const response = await api.auth.signup(email, password, roleId);

        if (response.data) {
            utils.showAlert('Account created successfully! Please log in.', 'success');

            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        } else {
            throw new Error('Invalid signup response');
        }
    } catch (error) {
        showError(error.message || 'Signup failed. Please try again.');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}