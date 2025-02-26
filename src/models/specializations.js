const { Schema, model } = require('mongoose');

const SpecializationsSchema = new Schema({
    name: { type: String }
}, {
    timestamps: true
});

module.exports = model('Specialization', SpecializationsSchema);
