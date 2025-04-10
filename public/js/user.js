document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfo();
    if (!userInfo || userInfo.isAdmin) {
        window.location.href = !userInfo ? 'login.html' : 'admin.html';
        return; 
    }

    const welcomeUser = document.getElementById('welcome-user');
    if(welcomeUser) welcomeUser.textContent = `Welcome, ${userInfo.username}!`;

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    fetchAvailableRooms();
    fetchUserBookings();

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);
});

async function fetchAvailableRooms() {
    const roomsListDiv = document.getElementById('available-rooms-list');
    displayMessage('user-dashboard-message', '');
    roomsListDiv.innerHTML = '<p>Loading available rooms...</p>';

    try {
        const response = await fetchWithAuth('/api/rooms?available=true');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rooms = await response.json();

        if (rooms.length === 0) {
            roomsListDiv.innerHTML = '<p>No rooms are currently available.</p>';
        } else {
            roomsListDiv.innerHTML = rooms.map(room => `
                <div class="room-item" data-room-id="${room._id}">
                    <h3>${room.type}</h3>
                    <p>Price: $${room.price}/night</p>
                    <button class="select-room-btn">Select for Booking</button>
                </div>
            `).join('');
            document.querySelectorAll('.select-room-btn').forEach(button => {
                button.addEventListener('click', handleRoomSelection);
            });
        }
    } catch (error) {
        console.error('Error fetching available rooms:', error);
        roomsListDiv.innerHTML = '<p class="error-message">Error loading available rooms. Please try again later.</p>';
        displayMessage('user-dashboard-message', 'Could not load rooms.', true);
    }
}

function handleRoomSelection(event) {
    const roomItem = event.target.closest('.room-item');
    const roomId = roomItem.dataset.roomId;
    const roomType = roomItem.querySelector('h3').textContent;
    const roomPrice = roomItem.querySelector('p').textContent.split('$')[1].split('/')[0];

    document.getElementById('booking-room-id').value = roomId;
    document.getElementById('selected-room-type').textContent = roomType;
    document.getElementById('selected-room-price').textContent = roomPrice;
    document.getElementById('booking-details').style.display = 'block';

    displayMessage('booking-form-message', '');

    document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
}

async function handleBookingSubmit(event) {
    event.preventDefault();
    const roomId = document.getElementById('booking-room-id').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    displayMessage('booking-form-message', 'Processing booking...');

    try {
        const response = await fetchWithAuth('/api/bookings', {
            method: 'POST',
            body: { roomId, startDate, endDate }
        });

        const data = await response.json();

        if (response.ok) {
            displayMessage('booking-form-message', 'Booking successful!', false);
            fetchUserBookings();
            fetchAvailableRooms();
            document.getElementById('booking-form').reset();
            document.getElementById('booking-details').style.display = 'none';
        } else {
            displayMessage('booking-form-message', data.message || 'Booking failed.', true);
        }
    } catch (error) {
        console.error('Booking submission error:', error);
        displayMessage('booking-form-message', 'An error occurred while booking. Please try again.', true);
    }
}

async function fetchUserBookings() {
    const bookingsListDiv = document.getElementById('user-bookings-list');
    bookingsListDiv.innerHTML = '<p>Loading your bookings...</p>';

    try {
        const response = await fetchWithAuth('/api/bookings/mybookings');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bookings = await response.json();

        if (bookings.length === 0) {
            bookingsListDiv.innerHTML = '<p>You have no bookings yet.</p>';
        } else {
            bookingsListDiv.innerHTML = bookings.map(booking => `
                <div class="booking-item" data-booking-id="${booking._id}">
                    <h4>Room: ${booking.roomId?.type || 'N/A'}</h4>
                    <p>Dates: ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</p>
                    <p>Total Price: $${booking.totalPrice.toFixed(2)}</p>
                    <p>Status: ${booking.status}</p>
                    ${booking.status === 'Confirmed' ? 
                        '<button class="cancel-booking-btn">Cancel Booking</button>'
                        : ''}
                    <div class="booking-item-message message-area"></div>
                </div>
            `).join('');

            document.querySelectorAll('.cancel-booking-btn').forEach(button => {
                button.addEventListener('click', handleCancelBooking);
            });
        }
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        bookingsListDiv.innerHTML = '<p class="error-message">Error loading your bookings. Please try again later.</p>';
         displayMessage('user-dashboard-message', 'Could not load your bookings.', true);
    }
}

async function handleCancelBooking(event) {
    const bookingItem = event.target.closest('.booking-item');
    const bookingId = bookingItem.dataset.bookingId;
    const messageElementId = `booking-item-message-${bookingId}`;

     let messageDiv = bookingItem.querySelector('.booking-item-message');
     messageDiv.id = messageElementId;

    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    displayMessage(messageElementId, 'Cancelling booking...');

    try {
        const response = await fetchWithAuth(`/api/bookings/${bookingId}/cancel`, {
            method: 'PUT' 
        });

        const data = await response.json();

        if (response.ok) {
            displayMessage(messageElementId, 'Booking cancelled successfully.', false);
            fetchUserBookings();
            fetchAvailableRooms();
        } else {
            displayMessage(messageElementId, data.message || 'Failed to cancel booking.', true);
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        displayMessage(messageElementId, 'An error occurred while cancelling.', true);
    }
}