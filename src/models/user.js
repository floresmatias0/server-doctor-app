const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, default: '' },
  role: { type: String, enum: ['PATIENT', 'DOCTOR'], default: 'PATIENT' },
  picture: { type: String },
  googleId: { type: String, default: '' },
  accessToken: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
  mercadopago_access: { type: Map, of: String, default: {} },
  reservePrice: { type: Number, default: 500 },
  reserveTime: { type: Number, default: 15 },
  super: { type: Boolean, default: false },
  especialization: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = model('User', UserSchema);
