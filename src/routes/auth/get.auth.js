const passport = require('passport');
const { updateUser } = require('../../controllers/users');
const server = require('express').Router();

server.get('/google', (req, res, next) => {
    const { role } = req.query
    const scope = [ 'email', 'profile', 'https://www.googleapis.com/auth/calendar' ]

    if(role === "PATIENT") {
        scope.pop()
    }
    passport.authenticate('google', {
        scope,
        accessType: 'offline',
        prompt: 'consent',
    })(req, res, next);
});

server.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/v1/auth/google/success',
        failureRedirect: '/v1/auth/google/failure'
    }
));

server.get('/google/success', (req, res) => {
    const { user } = req.session.passport;
    res.redirect(process.env.FRONTEND_URL + '/verify?_valid=' + user?._id);
});

server.get('/google/failure', (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
});

server.get('/google/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error al destruir la sesión:', err);
        }
        res.clearCookie('connect.sid', {
            path: '/'
        }); // Eliminar la cookie de sesión
        res.redirect(`${process.env.FRONTEND_URL}/login`); // Redirigir después de cerrar sesión
    });
});

server.get('/mercadopago', async (req, res, next) => {
    try {
        //ESTE CODE ES VALIDO SOLO POR 10MIN
        const { user_id, code } = req.query;

        const body = JSON.stringify({
            "client_secret": process.env.MERCADOPAGO_CLIENT_SECRET,
            "client_id": process.env.MERCADOPAGO_CLIENT_ID,
            "grant_type": "authorization_code",
            code
        });

        const response = await fetch('https://api.mercadopago.com/oauth/token', {
            'method': 'POST',
            'headers': {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body
        })

        await updateUser(user_id, {
            'mercadopago_access': req.session
        })

        res.redirect(`${process.env.FRONTEND_URL}/profile`);
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;