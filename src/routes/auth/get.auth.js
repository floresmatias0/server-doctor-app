const passport = require('passport')
const server = require('express').Router();

server.get('/', (req, res, next) => {
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

server.get('/callback',
    passport.authenticate('google', {
        successRedirect: '/v1/auth/google/success',
        failureRedirect: '/v1/auth/google/failure'
    }
));

server.get('/success', (req, res) => {
    const { user } = req.session.passport;
    res.redirect(process.env.FRONTEND_URL + '/verify?_valid=' + user?._id);
});

server.get('/failure', (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
});

server.get('/logout', (req, res) => {
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
module.exports = server;