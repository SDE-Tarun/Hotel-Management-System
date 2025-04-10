const Booking = require('../models/Booking');
const Room = require('../models/Room');


const createBooking = async (req, res) => {
    const { roomId, startDate, endDate } = req.body;
    const userId = req.user._id;

    if (!roomId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Please provide room ID, start date, and end date' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return res.status(400).json({ message: 'Invalid start or end date' });
    }

    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (!room.isAvailable) {
            return res.status(400).json({ message: 'Room is not available for booking' });
        }

        const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (durationInDays <= 0) {
             return res.status(400).json({ message: 'Booking duration must be at least one day' });
        }
        const totalPrice = room.price * durationInDays;

        const booking = new Booking({
            userId,
            roomId,
            startDate: start,
            endDate: end,
            totalPrice,
            status: 'Confirmed'
        });

        const createdBooking = await booking.save();

        res.status(201).json(createdBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error creating booking' });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
                                    .populate('roomId', 'type price');  

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Server error fetching bookings' });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
                                    .populate('userId', 'username email')
                                    .populate('roomId', 'type price description');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking by ID:', error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(500).json({ message: 'Server error fetching booking' });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
             return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        booking.status = 'Cancelled';
        const updatedBooking = await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(500).json({ message: 'Server error cancelling booking' });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
                                    .populate('userId', 'username email')
                                    .populate('roomId', 'type price')
                                    .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ message: 'Server error fetching all bookings' });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings
}; 