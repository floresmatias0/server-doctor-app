const server = require('express').Router();
const { createUser, updateUser } = require('../../controllers/users');

const { MercadoPagoConfig, OAuth } = require('mercadopago');
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_LOCAL_ACCESS_TOKEN });

const oauth = new OAuth(client);

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
        //TO REFRESH TOKEN, BUT THE TOKEN LASTS 180 DAYS
        // const body = JSON.stringify({
        //   "client_secret": import.meta.env.VITE_MERCADOPAGO_CLIENT_SECRET,
        //   "client_id": import.meta.env.VITE_MERCADOPAGO_CLIENT_ID,
        //   "grant_type": "refresh_token",
        //   "code": code,
        //   "redirect_uri": `${import.meta.env.VITE_MERCADOPAGO_REDIRECT_URL}`,
        //   "refresh_token": user?.mercadopago_access?.refresh_token
        // });
    
        const { code, user_id } = req.body;

        const body = {
            "client_secret": process.env.MERCADOPAGO_CLIENT_SECRET,
            "client_id": process.env.MERCADOPAGO_CLIENT_ID,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": process.env.MERCADOPAGO_OAUTH_REDIRECT_URL
        }
        
        const response = await oauth.create({body})
        
        if(!response?.access_token) {
            return res.status(400).json({
                success: false,
                error: { response, body }
            });
        }

        await updateUser(user_id, {
            mercadopago_access: response
        })

        return res.status(200).json({
            success: true,
            data: 'User data mercadopago update'
        });
    }catch(err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            error: err
        });
    }
});


module.exports = server;