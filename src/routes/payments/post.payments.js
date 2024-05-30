const axios = require('axios');
const fetch = require('node-fetch');
const server = require('express').Router();

const { findUserByEmail } = require('../../controllers/users');
const { createEvent } = require('../../controllers/calendars');
const { createPayment } = require('../../controllers/payments');

server.post('/create', async (req, res) => {
    try {
        const { unit_price, user_email, tutor_email, startDateTime, endDateTime, patient, symptoms } = req.body;
        const doctor = await findUserByEmail(user_email);

        if(doctor) {
            const access_token = doctor?.mercadopago_access?.access_token
            const idsSimptoms = symptoms.map(symptom => symptom._id);

            let commision = (unit_price * 10) / 100;

            let preference = {
                items: [
                  {
                    title: 'Consulta medica',
                    unit_price,
                    quantity: 1
                  }
                ],
                back_urls: {
                    "success": `${process.env.FRONTEND_URL}/turnos?status=approved&doctor=${user_email}&patient=${patient}&startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
                    "failure": `${process.env.FRONTEND_URL}/turnos?status=rejected`,
                    "pending": `${process.env.FRONTEND_URL}/turnos?status=pending`
                },
                auto_return: "all",
                marketplace_fee: commision,
                notification_url: `${process.env.NOTIFICATION_URL}?access_token=${access_token}&doctor=${user_email}&user=${tutor_email}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&symptoms=${idsSimptoms}&patient=${patient}`,
                statement_descriptor: "Zona Pediatrica"
            };

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

server.post('/webhook/mercadopago', async (req, res) => {
    try {
        const { action } = req?.body;
        const { access_token } = req?.query;

        if (action !== "payment.created") {
            return res.status(200).json({
                success: false,
                message: "Notificación ignorada, motivo: no es una notificación de pago"
            });
        }

        const paymentId = req.body?.data?.id;
        const response = await axios.request({
            method: 'GET',
            url: `https://api.mercadopago.com/v1/payments/${paymentId}?access_token=${access_token}`,
            headers: { 
                'Content-Type': 'application/json'
            }
        });

        if(response && response?.data) {
            const { data } = response;
            const { doctor, user, startDateTime, endDateTime, symptoms, patient } = req.query;

            const doc = await findUserByEmail(doctor);

            if(data?.status === "approved") {
                await createEvent(doctor, user, 'Consulta medica', startDateTime, endDateTime, symptoms, patient)
                await createPayment({
                    payment_id: data?.id,
                    merchant_order_id: '',
                    status: data?.status,
                    payer: user,
                    doctor: doc
                })
            }

            return res.status(500).json({
                success: false,
                message: "Se logro obtener los datos del pago"
            });
        }

        return res.status(500).json({
            success: false,
            message: "No se pudo obtener los datos del pago"
        });
    }catch(err) {
        console.log({err})
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

module.exports = server;