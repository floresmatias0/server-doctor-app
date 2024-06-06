const { Schema, model } = require('mongoose');

const BookingSchema = new Schema({
  booking_id: { type: String },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String },
  summary: { type: String },
  organizer: {
    email: { type: String },
    name: { type: String }
  },
  start: { type: Date },
  end: { type: Date },
  hangoutLink: { type: String },
  symptoms: [{ type: Schema.Types.ObjectId, ref: 'Symptom' }],
  patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
  certificate: [{ type: Schema.Types.ObjectId, ref: 'Certificate' }]
}, {
  timestamps: true
});

module.exports = model('Booking', BookingSchema);
