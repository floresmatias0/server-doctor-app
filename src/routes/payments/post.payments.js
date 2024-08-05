const axios = require('axios');
const server = require('express').Router();

const { findUserByEmail } = require('../../controllers/users');
const { createEvent } = require('../../controllers/calendars');
const { createPayment } = require('../../controllers/payments');

const { MercadoPagoConfig, Preference } = require('mercadopago'); // --> PRUEBA NUEVO METODO

server.post('/create', async (req, res) => {
    try {
        const { unit_price, user_email, tutor_email, startDateTime, endDateTime, patient, symptoms } = req.body;
        const doctor = await findUserByEmail(user_email);

        if(doctor) {
            const access_token = doctor?.mercadopago_access?.access_token

            const client = new MercadoPagoConfig({ accessToken: access_token }); //--> PRUEBA NUEVO METODO
            const preference = new Preference(client); // --> PRUEBA NUEVO METODO

            const idsSimptoms = symptoms.map(symptom => symptom._id);
            
            let commision = (unit_price * 10) / 100;

            const generateUniqueId = (length = 16) => {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let result = '';
                const charactersLength = characters.length;
                for (let i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            }
            
            const uniqueId = generateUniqueId();

            const body = {
                items: [
                  {
                      id: `Medic ${uniqueId}`,
                      title: 'Consulta medica',
                      description: "Reunion privada con un medico especializado",
                      category_id: "turns",
                      currency_id: "ARS",
                      quantity: 1,
                      unit_price
                  },
                ],
                marketplace_fee: commision,
                back_urls: {
                  success: `${process.env.FRONTEND_URL}/turnos?status=approved`,
                  failure: `${process.env.FRONTEND_URL}/turnos?status=failure`,
                  pending: `${process.env.FRONTEND_URL}/turnos?status=pending`,
                },
                expires: false,
                auto_return: 'all',
                binary_mode: true,
                marketplace: 'marketplace',
                notification_url: `${process.env.NOTIFICATION_URL}/payments/webhook/mercadopago?access_token=${access_token}&doctor=${user_email}&user=${tutor_email}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&symptoms=${idsSimptoms}&patient=${patient}`,
                operation_type: 'regular_payment',
                statement_descriptor: 'Zona Pediatrica',
            };
            const data = await preference.create({ body }) // --> PRUEBA NUEVO METODO

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
        console.log(err?.message)
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
        console.log(req?.body, req?.query)
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
