const { findUserByEmail } = require('../../controllers/users');
const server = require('express').Router();
const mercadopago = require ('mercadopago');

server.post('/create', async (req, res) => {
    try {
        const { unit_price, user_email, startDateTime, endDateTime, patient_email, symptoms } = req.body;
        const doctor = await findUserByEmail(user_email);

        if(doctor) {
            mercadopago.configure({
                access_token: doctor?.mercadopago_access?.access_token
            });
            
            let commision = (unit_price * 10) / 100;

            let preference = {
                items: [
                  {
                    title: 'Consulta medica',
                    unit_price,
                    quantity: 1,
                  }
                ],
                back_urls: {
                    "success": `${process.env.BACKEND_URL}/v1/payments/feedback?doctor=${user_email}&patient=${patient_email}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&symptoms=${symptoms}`,
                    "failure": `${process.env.BACKEND_URL}/v1/payments/feedback`,
                    "pending": `${process.env.BACKEND_URL}/v1/payments/feedback`
                },
                auto_return: "approved",
                marketplace_fee: commision
            };

            const response = await mercadopago.preferences.create(preference);

            return res.status(200).json({
                success: true,
                data: response.body
            });
        }

        return res.status(401).json({
            success: false,
            error: "Usuario no encontrado"
        });
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

module.exports = server;