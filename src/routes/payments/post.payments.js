const { findUserByEmail } = require('../../controllers/users');
const server = require('express').Router();
const mercadopago = require ('mercadopago');

server.post('/create', async (req, res) => {
    try {
        const { unit_price, user_email } = req.body;
        const doctor = await findUserByEmail(user_email);
        if(doctor) {
            
            mercadopago.configure({
                access_token: doctor?.mercadopago_access?.access_token
            });
    
            let preference = {
                "items": [
                  {
                    title: 'Consulta medica',
                    unit_price,
                    quantity: 1,
                  }
                ],
                "back_urls": {
                    "failure": "",
                    "pending": process.env.FRONTEND_URL,
                    "success": process.env.FRONTEND_URL
                },
                "auto_return": "approved"
            };

            const response = await mercadopago.preferences.create(preference);

            return res.status(200).json({
                success: true,
                data: response.body.id
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