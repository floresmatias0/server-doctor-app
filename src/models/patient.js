const { Schema, model } = require('mongoose');

const PatientSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  birthdate: { type: Date },
  picture: { type: String },
  genre: { type: String, enum : ['male', 'female', 'other'], default: 'male' },
  phone: { type: String },
  email: { type: String },
  history: { type: String },
  dni: { type: String }
}, {
    timestamps: true
});

module.exports = model('Patient', PatientSchema);