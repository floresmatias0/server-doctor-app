const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, default: '' },
  role: { type: String, default: 'PATIENT' },
  picture: { type: String },
  googleId: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
}, {
    timestamps: true
});

module.exports = model('User', UserSchema);