const { Schema, model } = require('mongoose');

const BookingSchema = new Schema({
  booking_id: { type: String },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String },
  summary: { type: String },
  organizer: {
    email: { type: String },
    name: { type: String },
    role: { type: String },
    picture: { type: String },
    price: { type: Number },
    time: { type: Number }
  },
  start: {
    dateTime: Date,
    timeZone: String,
  },
  end: {
      dateTime: Date,
      timeZone: String,
  },
  hangoutLink: { type: String },
  symptoms: [{ type: Schema.Types.ObjectId, ref: 'Symptom' }],
  patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
  certificate: [{ type: Schema.Types.ObjectId, ref: 'Certificate' }],
  details: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = model('Booking', BookingSchema);
