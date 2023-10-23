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
  symptoms: [{ type: Schema.Types.ObjectId, ref: 'Symptom' }],
  name: { type: String }
}, {
    timestamps: true
});

module.exports = model('Booking', BookingSchema);