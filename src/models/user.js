const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, default: '' },
  role: { type: String, default: 'PATIENT' },
  picture: { type: String },
  googleId: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  mercadopago_access: { type: Object, default: '' },
}, {
    timestamps: true
});

module.exports = model('User', UserSchema);