
document.getElementById('admin-register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const adminSecret = document.getElementById('admin-secret').value;
    const messageId = 'admin-register-message';

    displayMessage(messageId, '');

    if (!username || !email || !password || !adminSecret) {
        displayMessage(messageId, 'Please fill in all fields.', true);
        return;
    }
    if (password.length < 6) {
        displayMessage(messageId, 'Password must be at least 6 characters long.', true);
        return;
    }

    displayMessage(messageId, 'Registering admin...');

    try {
        const response = await fetch('/api/auth/register-admin', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, adminSecret })
        });

        const data = await response.json();

        if (response.status === 201) {
            displayMessage(messageId, 'Admin registered successfully! Redirecting to login...', false);
            setTimeout(() => {
                 window.location.href = 'login.html';
            }, 1500);
        } else {
            displayMessage(messageId, data.message || 'Admin registration failed.', true);
        }
    } catch (error) {
        console.error('Admin registration error:', error);
        displayMessage(messageId, 'An error occurred during admin registration.', true);
    }
});
