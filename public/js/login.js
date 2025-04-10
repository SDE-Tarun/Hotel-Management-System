document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('login-message') || createMessageDiv('login-form');

    const email = emailInput.value;
    const password = passwordInput.value;
    messageDiv.textContent = '';

    if (!email || !password) {
        messageDiv.textContent = 'Please enter both email and password.';
        messageDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data.user)); 
            
            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.style.color = 'green';

            window.location.href = data.user.isAdmin ? 'admin.html' : 'user.html';
        } else {
            messageDiv.textContent = data.message || 'Login failed. Please check your credentials.';
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Login error:', error);
        messageDiv.textContent = 'An error occurred during login. Please try again later.';
        messageDiv.style.color = 'red';
    }
});

function createMessageDiv(formId) {
    const form = document.getElementById(formId);
    let messageDiv = document.getElementById(`${formId}-message`);
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = `${formId}-message`;
        messageDiv.style.marginTop = '10px';
        form.parentNode.insertBefore(messageDiv, form.nextSibling);
    }
    return messageDiv;
}