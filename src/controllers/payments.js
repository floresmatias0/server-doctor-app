const Payment = require("../models/payment");

const createPayment = async (data) => {
    try {
        const { payment_id, merchant_order_id, status, payer, doctor } = data;

        return await Payment.create({
            payment_id,
            merchant_order_id,
            status,
            payer,
            doctor
        });
    }catch(err) {
        console.log(err)
        throw new Error(err.message)
    }
}

const getPayment = async (data) => {
    try {
        return await Payment.findOne(data);
    }catch(err) {
        console.log(err)
        throw new Error(err.message)
    }
}

module.exports = {
    createPayment,
    getPayment
};