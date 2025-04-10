document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.isAdmin) {
        window.location.href = !userInfo ? 'login.html' : 'user.html';
        return;
    }

    const welcomeAdmin = document.getElementById('welcome-admin');
    if(welcomeAdmin) welcomeAdmin.textContent = `Welcome, Admin ${userInfo.username}!`;

    const logoutButton = document.getElementById('admin-logout-button');
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    fetchExistingRooms();
    fetchAllBookings();

    const roomForm = document.getElementById('room-form');
    if (roomForm) roomForm.addEventListener('submit', handleAddEditRoomSubmit);

    const clearButton = document.getElementById('room-form-clear-btn');
    if (clearButton) clearButton.addEventListener('click', clearRoomForm);
});

async function fetchExistingRooms() {
    const roomsListDiv = document.getElementById('existing-rooms-list');
    roomsListDiv.innerHTML = '<p>Loading rooms...</p>';

    try {
        const response = await fetchWithAuth('/api/rooms');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const rooms = await response.json();

        if (rooms.length === 0) {
            roomsListDiv.innerHTML = '<p>No rooms have been added yet.</p>';
        } else {
            roomsListDiv.innerHTML = rooms.map(room => `
                <div class="room-item admin-room-item" data-room-id="${room._id}">
                    <h4>${room.type} ($${room.price}/night)</h4>
                    <p>Available: ${room.isAvailable ? 'Yes' : 'No'}</p>
                    <div>
                        <button class="edit-room-btn">Edit</button>
                        <button class="delete-room-btn">Delete</button>
                        <button class="toggle-availability-btn">Toggle Availability</button>
                    </div>
                    <div class="room-item-message message-area"></div>
                </div>
            `).join('');

            document.querySelectorAll('.edit-room-btn').forEach(btn => btn.addEventListener('click', handleEditRoomClick));
            document.querySelectorAll('.delete-room-btn').forEach(btn => btn.addEventListener('click', handleDeleteRoomClick));
            document.querySelectorAll('.toggle-availability-btn').forEach(btn => btn.addEventListener('click', handleToggleAvailabilityClick));
        }
    } catch (error) {
        console.error('Error fetching existing rooms:', error);
        roomsListDiv.innerHTML = '<p class="error-message">Error loading rooms.</p>';
         displayMessage('admin-dashboard-message', 'Could not load rooms.', true);
    }
}

function clearRoomForm() {
    const roomForm = document.getElementById('room-form');
    roomForm.reset();
    document.getElementById('room-id').value = '';
    document.getElementById('room-form-submit-btn').textContent = 'Add Room';
    document.getElementById('room-form-clear-btn').style.display = 'none';
    displayMessage('room-form-message', '');
}

function handleEditRoomClick(event) {
    const roomItem = event.target.closest('.admin-room-item');
    const roomId = roomItem.dataset.roomId;
    
    fetchWithAuth(`/api/rooms/${roomId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch room details');
            return response.json();
        })
        .then(room => {
            document.getElementById('room-id').value = room._id;
            document.getElementById('room-type').value = room.type;
            document.getElementById('room-price').value = room.price;
            document.getElementById('room-available').checked = room.isAvailable;

            document.getElementById('room-form-submit-btn').textContent = 'Update Room';
            document.getElementById('room-form-clear-btn').style.display = 'inline-block';
            displayMessage('room-form-message', '');

            document.getElementById('room-form').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error loading room for edit:', error);
            displayMessage('admin-dashboard-message', 'Could not load room details for editing.', true);
        });
}

async function handleAddEditRoomSubmit(event) {
    event.preventDefault();
    const roomId = document.getElementById('room-id').value;
    const isEditing = !!roomId;
    const messageId = 'room-form-message';

    const roomData = {
        type: document.getElementById('room-type').value,
        price: parseFloat(document.getElementById('room-price').value),
        isAvailable: document.getElementById('room-available').checked
    };

    if (!roomData.type || isNaN(roomData.price) || roomData.price < 0) {
        displayMessage(messageId, 'Please provide a valid room type and non-negative price.', true);
        return;
    }

    const url = isEditing ? `/api/rooms/${roomId}` : '/api/rooms';
    const method = isEditing ? 'PUT' : 'POST';

    displayMessage(messageId, isEditing ? 'Updating room...' : 'Adding room...');

    try {
        const response = await fetchWithAuth(url, {
            method: method,
            body: roomData
        });
        const data = await response.json();

        if (response.ok) {
            displayMessage(messageId, `Room ${isEditing ? 'updated' : 'added'} successfully!`, false);
            clearRoomForm();
            fetchExistingRooms();
        } else {
            displayMessage(messageId, data.message || `Failed to ${isEditing ? 'update' : 'add'} room.`, true);
        }
    } catch (error) {
        console.error(`Error ${isEditing ? 'updating' : 'adding'} room:`, error);
        displayMessage(messageId, `An error occurred while ${isEditing ? 'updating' : 'adding'} the room.`, true);
    }
}

async function handleDeleteRoomClick(event) {
    const roomItem = event.target.closest('.admin-room-item');
    const roomId = roomItem.dataset.roomId;
    const messageId = `room-item-message-${roomId}`;
    const messageDiv = roomItem.querySelector('.room-item-message');
    messageDiv.id = messageId;

    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
        return;
    }

    displayMessage(messageId, 'Deleting room...');

    try {
        const response = await fetchWithAuth(`/api/rooms/${roomId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (response.ok) {
            fetchExistingRooms();
        } else {
             displayMessage(messageId, data.message || 'Failed to delete room.', true);
        }
    } catch (error) {
        console.error('Error deleting room:', error);
        displayMessage(messageId, 'An error occurred while deleting the room.', true);
    }
}

async function handleToggleAvailabilityClick(event) {
    const roomItem = event.target.closest('.admin-room-item');
    const roomId = roomItem.dataset.roomId;
    const messageId = `room-item-message-${roomId}`;
    const messageDiv = roomItem.querySelector('.room-item-message');
    messageDiv.id = messageId;

     const isCurrentlyAvailableText = roomItem.querySelector('p:nth-of-type(1)').textContent.includes('Yes');
     const newAvailability = !isCurrentlyAvailableText;

    displayMessage(messageId, 'Updating availability...');

    try {
        const response = await fetchWithAuth(`/api/rooms/${roomId}/availability`, {
            method: 'PATCH',
            body: { isAvailable: newAvailability }
        });
        const data = await response.json();

        if (response.ok) {
             displayMessage(messageId, `Availability updated to ${newAvailability}.`, false);
             fetchExistingRooms();
        } else {
            displayMessage(messageId, data.message || 'Failed to update availability.', true);
        }
    } catch (error) {
        console.error('Error toggling availability:', error);
         displayMessage(messageId, 'An error occurred while updating availability.', true);
    }
}

async function fetchAllBookings() {
    const bookingsListDiv = document.getElementById('all-bookings-list');
    bookingsListDiv.innerHTML = '<p>Loading all bookings...</p>';

    try {
        const response = await fetchWithAuth('/api/bookings/all');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const bookings = await response.json();

        if (bookings.length === 0) {
            bookingsListDiv.innerHTML = '<p>There are no bookings in the system yet.</p>';
        } else {
            bookingsListDiv.innerHTML = bookings.map(booking => `
                <div class="booking-item admin-booking-item" data-booking-id="${booking._id}">
                    <h4>Booking ID: ${booking._id}</h4>
                    <p>User: ${booking.userId?.username || 'N/A'} (${booking.userId?.email || 'N/A'})</p>
                    <p>Room: ${booking.roomId?.type || 'N/A'}</p>
                    <p>Dates: ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</p>
                    <p>Total Price: $${booking.totalPrice.toFixed(2)}</p>
                    <p>Status: ${booking.status}</p>
                    ${booking.status === 'Confirmed' ? 
                        '<button class="cancel-booking-admin-btn">Cancel Booking</button>'
                        : ''}
                     <div class="booking-item-message message-area"></div>
                </div>
            `).join('');

             document.querySelectorAll('.cancel-booking-admin-btn').forEach(button => {
                button.addEventListener('click', handleCancelBookingAdminClick);
            });
        }
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        bookingsListDiv.innerHTML = '<p class="error-message">Error loading bookings.</p>';
        displayMessage('admin-dashboard-message', 'Could not load bookings.', true);
    }
}

async function handleCancelBookingAdminClick(event) {
    const bookingItem = event.target.closest('.admin-booking-item');
    const bookingId = bookingItem.dataset.bookingId;
    const messageId = `booking-item-message-${bookingId}`;
    const messageDiv = bookingItem.querySelector('.booking-item-message');
    messageDiv.id = messageId;

    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    displayMessage(messageId, 'Cancelling booking...');

    try {
        const response = await fetchWithAuth(`/api/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });

        const data = await response.json();

        if (response.ok) {
            displayMessage(messageId, 'Booking cancelled successfully.', false);
            fetchAllBookings();
        } else {
            displayMessage(messageId, data.message || 'Failed to cancel booking.', true);
        }
    } catch (error) {
        console.error('Error cancelling booking (admin):', error);
        displayMessage(messageId, 'An error occurred while cancelling.', true);
    }
}