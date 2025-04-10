document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('register-message') || createMessageDiv('register-form');

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    messageDiv.textContent = '';

    if (!username || !email || !password) {
        messageDiv.textContent = 'Please fill in all required fields.';
        messageDiv.style.color = 'red';
        return;
    }
    if (password.length < 6) {
        messageDiv.textContent = 'Password must be at least 6 characters long.';
        messageDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/api/auth/register', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.status === 201) {
            messageDiv.textContent = 'Registration successful! Redirecting to login...';
            messageDiv.style.color = 'green';
            setTimeout(() => {
                 window.location.href = 'login.html';
            }, 1500);
        } else {
            messageDiv.textContent = data.message || 'Registration failed. Please try again.';
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Registration error:', error);
        messageDiv.textContent = 'An error occurred during registration. Please try again later.';
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