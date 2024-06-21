const { Schema, model } = require('mongoose');

const PatientSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  dateOfBirth: { type: Date, default: null },
  picture: { type: String },
  genre: { type: String, enum: ['MASCULINO', 'FEMENINO', 'OTRO'], default: 'OTRO' },
  phone: { type: Number },
  email: { type: String },
  history: { type: String },
  identityType: { type: String, enum: ['DNI', 'CC', 'CI'], default: 'DNI' },
  identityId: { type: Number, default: 0 },
  socialWork: { type: String },
  socialWorkId: { type: Number },
  proceedings: { type: String }
}, {
  timestamps: true
});

module.exports = model('Patient', PatientSchema);