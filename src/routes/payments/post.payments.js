const axios = require('axios');
const server = require('express').Router();

const { findUserByEmail } = require('../../controllers/users');
const { createEvent } = require('../../controllers/calendars');
const { createPayment, getPayment } = require('../../controllers/payments');

const { MercadoPagoConfig, Preference } = require('mercadopago'); // --> PRUEBA NUEVO METODO
const { reservedShift } = require('../../controllers/messages');

server.post('/create', async (req, res) => {
    try {
        const { unit_price, user_email, tutor_email, startDateTime, endDateTime, patient, symptoms } = req.body;
        const doctor = await findUserByEmail(user_email);

        if(doctor) {
            const access_token = doctor?.mercadopago_access?.access_token
            // const access_token = 'APP_USR-3936245486590128-040611-54994be7d12fb4d622883318476340ee-1467206734' //--> TOKEN CUENTA DE PRUEBA
            const client = new MercadoPagoConfig({ accessToken: access_token }); //--> PRUEBA NUEVO METODO
            const preference = new Preference(client); // --> PRUEBA NUEVO METODO

            const idsSimptoms = symptoms?.map(symptom => symptom._id);

            const notificationData = { 
                d: user_email,
                u: tutor_email,
                sd: startDateTime,
                ed: endDateTime,
                p: patient,
                s: idsSimptoms
            };

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
                notification_url: `${process.env.NOTIFICATION_URL}?d=${user_email}`,
                operation_type: 'regular_payment',
                statement_descriptor: 'Zona Med',
                metadata: {
                    notificationData
                }
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
        const { d } = req?.query;

        const doctor = await findUserByEmail(d);
         //const access_token = 'APP_USR-3936245486590128-040611-54994be7d12fb4d622883318476340ee-1467206734' //--> TOKEN DE PRUEBA
        const access_token = doctor?.mercadopago_access?.access_token;
  
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

            const metadata = data?.metadata;
            const { u, sd, ed, s, p } = metadata?.notification_data;

            const payment = await getPayment({ payment_id: (data?.id).toString() });

            if(data?.status === "approved" && !payment) {
                const order_id = data?.order?.id;

                await createEvent(d, u, 'Consulta medica', sd, ed, s, p, order_id);
                await createPayment({
                    payment_id: data?.id,
                    merchant_order_id: order_id,
                    status: data?.status,
                    payer: u,
                    doctor
                })

                await reservedShift(
                    d,
                    true,
                    'Tiene un nuevo turno agendado.',
                    p,
                    `${doctor?.firstName} ${doctor?.lastName}` || `${doctor?.name}`,
                    `${doctor?.especialization}`,
                    sd,
                    doctor?.reservePrice,
                    'bookingIdTest',
                    d
                )

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
        console.log(err)
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

module.exports = server;