const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, default: '' },
  role: { type: String, enum : ['PATIENT','DOCTOR'], default: 'PATIENT' },
  picture: { type: String },
  googleId: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  mercadopago_access: { type: Object, default: '' },
  reservePrice: { type: Number, default: 500 },
  reserveTime: { type: Number, default: 15 },
  super: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = model('User', UserSchema);