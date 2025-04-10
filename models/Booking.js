const mongoose = require('mongoose')
const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
})
module.exports = mongoose.model('Booking', BookingSchema)
