const { findUserByEmail } = require('../../controllers/users');
const server = require('express').Router();
const fetch = require('node-fetch');

server.post('/create', async (req, res) => {
    try {
        const { unit_price, user_email, startDateTime, endDateTime, patient_email, symptoms } = req.body;
        const doctor = await findUserByEmail(user_email);

        if(doctor) {
            const access_token = doctor?.mercadopago_access?.access_token
            console.log({symptoms})
            const stringifySymptom = JSON.stringify(symptoms)

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
                    "success": `${process.env.BACKEND_URL}/payments/feedback?doctor=${user_email}&patient=${patient_email}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&symptoms=${stringifySymptom}`,
                    "failure": `${process.env.BACKEND_URL}/payments/feedback`,
                    "pending": `${process.env.BACKEND_URL}/payments/feedback`
                },
                auto_return: "approved",
                marketplace_fee: commision
            };

            // const response = await mercadopago.preferences.create(preference);
            const response = await fetch(`https://api.mercadopago.com/checkout/preferences?access_token=${access_token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preference)
            })

            const data = await response.json()

            return res.status(200).json({
                success: true,
                data
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