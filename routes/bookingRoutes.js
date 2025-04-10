const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createBooking);
router.route('/mybookings').get(protect, getMyBookings);
router.route('/all').get(protect, admin, getAllBookings); 
router.route('/:id').get(protect, getBookingById);
router.route('/:id/cancel').put(protect, cancelBooking);


module.exports = router; 