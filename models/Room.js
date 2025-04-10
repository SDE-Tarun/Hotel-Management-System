const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Please provide a room type'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price per night'],
        min: [0, 'Price cannot be negative']
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Room', RoomSchema)
