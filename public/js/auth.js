document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userInfo = getUserInfo();

    const userAuthSection = document.getElementById('user-auth-section');
    const adminAuthSection = document.getElementById('admin-auth-section');
    const userLinksNav = document.getElementById('user-links');
    const adminLinksNav = document.getElementById('admin-links');

    const setDisplay = (element, display) => {
        if (element) element.style.display = display;
    };

    if (token && userInfo) {
        setDisplay(userAuthSection, 'none');
        setDisplay(adminAuthSection, 'none');

        if (userInfo.isAdmin) {
            setDisplay(adminLinksNav, 'block');
            setDisplay(userLinksNav, 'none');
            const adminLogoutButton = document.getElementById('admin-logout-button');
            if (adminLogoutButton) {
                adminLogoutButton.removeEventListener('click', handleLogout); 
                adminLogoutButton.addEventListener('click', handleLogout);
            }
        } else {
            setDisplay(userLinksNav, 'block');
            setDisplay(adminLinksNav, 'none');
            const userLogoutButton = document.getElementById('logout-button');
            if (userLogoutButton) {
                userLogoutButton.removeEventListener('click', handleLogout); 
                userLogoutButton.addEventListener('click', handleLogout);
            }
        }

        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'login.html' || currentPage === 'register.html' || currentPage === 'admin-register.html') {
            window.location.href = userInfo.isAdmin ? 'admin.html' : 'user.html';
        }

    } else {
        setDisplay(userAuthSection, 'block');
        setDisplay(adminAuthSection, 'block');
        setDisplay(userLinksNav, 'none');
        setDisplay(adminLinksNav, 'none');

        const protectedPages = ['user.html', 'admin.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
}