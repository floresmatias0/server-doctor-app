const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  name: { type: String, default: '' },
  genre: { type: String, enum: ['MASCULINO', 'FEMENINO', 'OTRO'], default: 'OTRO' },
  email: { type: String, default: '' },
  role: { type: String, enum: ['PACIENTE', 'DOCTOR', 'ADMIN'], default: 'PACIENTE' },
  picture: { type: String, default: '' },
  googleId: { type: String, default: '' },
  accessToken: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
  mercadopago_access: { type: Object, default: {} },
  reservePrice: { type: Number, default: 500 },
  reserveTime: { type: Number, default: 15 },
  reserveTimeFrom: { type: Number, default: 10 },
  reserveTimeUntil: { type: Number, default: 19 },
  reserveSaturday: { type: Boolean, default: false },
  reserveSunday: { type: Boolean, default: false },
  especialization: { type: String, default: '' },
  dateOfBirth: { type: Date, default: null },
  phone: { type: String, default: '' },
  identityType: { type: String, enum: ['DNI', 'CC', 'CI'], default: 'DNI' },
  identityId: { type: Number, default: 0 },
  socialWork: { type: String, default: '' },
  socialWorkId: { type: Number, default: 0 },
  enrollment: { type: String, default: '' },
  validated: { type: String, default: 'incompleted' }
}, {
  timestamps: true
});

module.exports = model('User', UserSchema);
