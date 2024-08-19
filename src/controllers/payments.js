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

const getPayment = async (id) => {
    try {
        return await Payment.findOne({ payment_id: id } );
    }catch(err) {
        console.log(err)
        throw new Error(err.message)
    }
}

module.exports = {
    createPayment,
    getPayment
};