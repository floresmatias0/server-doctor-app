const { Schema, model } = require('mongoose');

const SymptomsSchema = new Schema({
  name: { type: String },
}, {
    timestamps: true
});

module.exports = model('Symptom', SymptomsSchema);