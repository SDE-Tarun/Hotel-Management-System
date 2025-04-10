const express = require('express');
const router = express.Router();
const {
    addRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    updateRoomAvailability
} = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, addRoom)
    .get(getAllRooms);

router.route('/:id')
    .get(getRoomById)
    .put(protect, admin, updateRoom)
    .delete(protect, admin, deleteRoom);

router.patch('/:id/availability', protect, admin, updateRoomAvailability);

module.exports = router; 