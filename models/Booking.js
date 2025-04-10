const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Pending'],
        default: 'Confirmed'
    }
})

BookingSchema.index({ userId: 1 })
BookingSchema.index({ roomId: 1 })
BookingSchema.index({ startDate: 1, endDate: 1 })

BookingSchema.pre('validate', function(next) {
    if (this.startDate && this.endDate && this.endDate <= this.startDate) {
        next(new Error('End date must be after start date'))
    } else {
        next()
    }
})

module.exports = mongoose.model('Booking', BookingSchema)
