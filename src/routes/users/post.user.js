const server = require('express').Router();
const { createUser, updateUser } = require('../../controllers/users');
const axios = require('axios');

server.post('/',
    async (req, res) => {
        const data = req.body;

        try {
            await createUser(data);
            return res.status(200).json({
                success: true,
                data: 'User created successfully'
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
);

server.post('/mercadopago', async (req, res) => {
    try {
        const { code, user_id } = req.body;

          const options = {
            "method": "POST",
            "url": process.env.MERCADOPAGO_OAUTH_TOKEN_URL,
            "headers": {
                "Content-type": "application/json"
            },
            "data": {
                "client_secret": process.env.MERCADOPAGO_CLIENT_SECRET,
                "client_id": process.env.MERCADOPAGO_CLIENT_ID,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": process.env.MERCADOPAGO_OAUTH_REDIRECT_URL
            }
          }
          const response = await axios.request(options)

        await updateUser(user_id, {
            mercadopago_access: response.data
        })

        return res.status(200).json({
            success: true,
            data: 'User data mercadopago update'
        });
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


module.exports = server;