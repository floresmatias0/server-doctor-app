const { Schema, model } = require('mongoose');

const BookingSchema = new Schema({
  booking_id: { type: String },
  user_id: { type: String },
  status: { type: String },
  summary: { type: String },
  organizer: { type: Object },
  start: { type: Object },
  end: { type: Object },
  hangoutLink: { type: String },
}, {
    timestamps: true
});

module.exports = model('Booking', BookingSchema);