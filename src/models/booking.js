const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    order_id: { type: String, default: "" },
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
        dateTime: String,
        timeZone: String
    },
    end: {
        dateTime: String,
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
    details: String
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;
