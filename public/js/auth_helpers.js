function getToken() {
    return localStorage.getItem('token');
}

function getUserInfo() {
    try {
        return JSON.parse(localStorage.getItem('userInfo'));
    } catch (e) {
        return null;
    }
}

async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (!token) {
        console.warn('No token found, redirecting to login.');
        window.location.href = 'login.html';
        throw new Error('Not authenticated');
    }

    const headers = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            console.warn('Unauthorized access, clearing token and redirecting to login.');
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = 'login.html';
            throw new Error('Unauthorized');
        }

        return response;

    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

function displayMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
        element.style.display = message ? 'block' : 'none';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
        return dateString;
    }
}

function handleLogout() {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = 'index.html';
} 