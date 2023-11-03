const { Schema, model } = require('mongoose');

const CertificateSchema = new Schema({
  filename: { type: String },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
  doctor: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = model('Certificate', CertificateSchema);