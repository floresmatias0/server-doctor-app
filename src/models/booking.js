const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    booking_id: String,
    user_id: String, // Verifica que el tipo de dato sea correcto
    status: String,
    summary: String,
    organizer: {
        _id: Schema.Types.ObjectId,
        name: String,
        email: String,
        role: String,
        picture: String,
        price: Number,
        time: Number
    },
    start: {
        dateTime: Date,
        timeZone: String
    },
    end: {
        dateTime: Date,
        timeZone: String
    },
    hangoutLink: String,
    symptoms: [String],
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient'
    },
    certificate: [{
        type: Schema.Types.ObjectId,
        ref: 'Certificate'
    }],
    createdAt: Date,
    updatedAt: Date,
    details: String
});

const Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;
