const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: String, required: true }, // Cambiado a String
  rating: { type: Number, required: true },
  comment: { type: String }
}, {
  timestamps: true
});

const Rating = mongoose.model('Rating', RatingSchema);
module.exports = Rating;
