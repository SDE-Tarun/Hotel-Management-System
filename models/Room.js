const mongoose = require('mongoose')
const RoomSchema = new mongoose.Schema({
    type: String,
    price: Number,
    available: { type: Boolean, default: true }
})
module.exports = mongoose.model('Room', RoomSchema)
