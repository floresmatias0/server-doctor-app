const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    order_id: { type: String, default: "" },
    booking_id: String,
    user_id: { type: String, default: null },  // Permite null como valor por defecto
    status: { 
        type: String, 
        default: 'pending',  // Valor por defecto para el estado
        enum: ['pending', 'confirmed', 'cancelled']  // Limita los valores posibles de status
    },
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
    symptoms: [{
        type: Schema.Types.ObjectId,
        ref: 'Symptom'
    }],
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient'
    },
    patientInfo: {  // Nuevo campo para almacenar información adicional del paciente
        name: String,
        tutorName: String,
        email: String
    },
    certificate: [{
        type: Schema.Types.ObjectId,
        ref: 'Certificate'
    }],
    details: { type: String, default: "" },
    originalStartTime: { type: Date, required: true },
    customBookingIdField: { type: String, unique: true, required: true },
    isRated: { type: Boolean, default: false },
    rating: {
        type: Schema.Types.ObjectId,
        ref: 'Rating'
    },
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;

