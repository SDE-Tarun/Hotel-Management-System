const Room = require('../models/Room');

const addRoom = async (req, res) => {
    const { type, price } = req.body;

    if (!type || price === undefined) {
        return res.status(400).json({ message: 'Please provide room type and price' });
    }

    try {
        const room = new Room({
            type,
            price,
            isAvailable: true
        });

        const createdRoom = await room.save();
        res.status(201).json(createdRoom);
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ message: 'Server error adding room' });
    }
};

const getAllRooms = async (req, res) => {
    try {
        if (req.query.available !== undefined && req.query.available !== 'true' && req.query.available !== 'false') {
            return res.status(400).json({ message: 'Please provide an \'isAvailable\' boolean value' });
        }
        
        const filter = req.query.available === 'true' ? { isAvailable: true } : 
                       req.query.available === 'false' ? { isAvailable: false } : {};
        
        const rooms = await Room.find(filter);
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Server error fetching rooms' });
    }
};

const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            res.json(room);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        console.error('Error fetching room by ID:', error);
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Room not found' });
        }
        res.status(500).json({ message: 'Server error fetching room' });
    }
};

const updateRoom = async (req, res) => {
    const { type, price, isAvailable } = req.body;

    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (type !== undefined) room.type = type;
        if (price !== undefined) room.price = price;
        if (isAvailable !== undefined) room.isAvailable = isAvailable;

        const updatedRoom = await room.save();
        res.json(updatedRoom);
    } catch (error) {
        console.error('Error updating room:', error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Room not found' });
        }
        res.status(500).json({ message: 'Server error updating room' });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        await room.deleteOne();
        res.json({ message: 'Room removed successfully' });

    } catch (error) {
        console.error('Error deleting room:', error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Room not found' });
        }
        res.status(500).json({ message: 'Server error deleting room' });
    }
};

const updateRoomAvailability = async (req, res) => {
    const { isAvailable } = req.body;

    if (isAvailable === undefined || typeof isAvailable !== 'boolean') {
        return res.status(400).json({ message: "Please provide an 'isAvailable' boolean value" });
    }

    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        room.isAvailable = isAvailable;
        await room.save();
        res.json({ message: `Room availability set to ${isAvailable}`, room });

    } catch (error) {
        console.error('Error updating room availability:', error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Room not found' });
        }
        res.status(500).json({ message: 'Server error updating availability' });
    }
};

module.exports = {
    addRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    updateRoomAvailability
}; 