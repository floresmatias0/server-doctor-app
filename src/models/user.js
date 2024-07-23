const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  name: { type: String },
  genre: { type: String, enum: ['MASCULINO', 'FEMENINO', 'OTRO'], default: 'OTRO' },
  email: { type: String, default: '' },
  role: { type: String, enum: ['PACIENTE', 'DOCTOR'], default: 'PACIENTE' },
  picture: { type: String },
  googleId: { type: String, default: '' },
  accessToken: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
  mercadopago_access: { type: Object, default: {} },
  reservePrice: { type: Number, default: 500 },
  reserveTime: { type: Number, default: 15 },
  super: { type: Boolean, default: false },
  especialization: { type: String, default: '' },
  dateOfBirth: { type: Date, default: null },
  phone: { type: String, default: '' },
  identityType: { type: String, enum: ['DNI', 'CC', 'CI'], default: 'DNI' },
  identityId: { type: Number, default: 0 },
  socialWork: { type: String, default: '' },
  socialWorkId: { type: Number, default: 0 },
  enrollment: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = model('User', UserSchema);
