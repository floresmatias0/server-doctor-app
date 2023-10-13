const { Schema, model } = require('mongoose');

const PaymentSchema = new Schema({
  payment_id: { type: String },
  merchant_order_id: { type: String },
  status: { type: String },
  payer: { type: String },
  doctor: { type: Object }
}, {
    timestamps: true
});

module.exports = model('Payment', PaymentSchema);