const server = require('express').Router();
const { createEvent } = require('../../controllers/calendars');
const { createPayment } = require('../../controllers/payments');

server.get('/create-order', async (req, res) => {
    try {
        const { id } = req.params;

        const events = await findAllBooking({ 'user_id': id })

        return res.status(200).json({
            success: true,
            data: events
        });
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

server.get('/success', async (req, res) => {
    try {
        const { id } = req.params;

        const events = await findAllBooking({ 'user_id': id })

        return res.status(200).json({
            success: true,
            data: events
        });
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

server.get('/webhook', async (req, res) => {
    try {
        const { id } = req.params;

        const events = await findAllBooking({ 'user_id': id })

        return res.status(200).json({
            success: true,
            data: events
        });
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

server.get('/feedback', async (req, res) => {
    try {
        const { payment_id, status, merchant_order_id, doctor, startDateTime, endDateTime, user, symptoms, patient } = req.query

        if(status === "approved") {

            await createEvent(doctor, user, 'Consulta medica', startDateTime, endDateTime, symptoms, patient)
            await createPayment({ payment_id, merchant_order_id, status, payer: user, doctor })
        }

        let url_redirect = `${process.env.FRONTEND_URL}/turnos?status=${status}&doctor=${doctor}&patient=${patient}&startDateTime=${startDateTime}&endDateTime=${endDateTime}`
        res.redirect(url_redirect);
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

module.exports = server;