const passport = require('passport');
const server = require('express').Router();

server.get('/google/', (req, res, next) => {
    const { role } = req.query
    const scope = [ 'email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events' ]

    if(role === "PATIENT") {
        scope.pop()
        scope.pop()
    }

    passport.authenticate('google', {
        scope,
        accessType: 'offline',
        prompt: 'consent',
        state: role,
        passReqToCallback: true
    })(req, res, next);
});

server.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/v1/auth/google/success',
        failureRedirect: '/v1/auth/google/failure'
    }
));

server.get('/google/success', (req, res) => {
    const { user } = req;
    res.redirect(process.env.FRONTEND_URL + '/verificacion?_valid=' + user?._id);
});

server.get('/google/failure', (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
});

server.get('/google/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error al destruir la sesión:', err);
            throw new Error("No se pudo destruir la session")
        }
        res.clearCookie('connect.sid', {
            path: '/'
        });
        res.redirect(`${process.env.FRONTEND_URL}/iniciar-sesion`); // Redirigir después de cerrar sesión
    });
});

module.exports = server;