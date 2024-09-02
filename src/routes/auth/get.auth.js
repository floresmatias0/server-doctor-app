const passport = require('passport');
const server = require('express').Router();

const calendarScopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
];

// Middleware para definir el scope según el rol
function defineGoogleScope(req, res, next) {
    try {
        const { role } = req.query;

        const baseScope = ['email', 'profile'];
        let scope;

        if (role === "PACIENTE") {
            scope = baseScope; // Pacientes no necesitan acceso al calendario
        } else {
            scope = [...baseScope, ...calendarScopes]; // Otros roles sí necesitan acceso al calendario
        }

        req.googleScope = scope;
        next();
    } catch (error) {
        next(error);
    }
}

server.get('/google/', defineGoogleScope, (req, res, next) => {
    try {
        passport.authenticate('google', {
            scope: req.googleScope,
            accessType: 'offline',
            prompt: 'consent',
            state: req.query.role,
            session: false
        })(req, res, next);
    } catch (error) {
        next(error);
    }
});

server.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err || !user) {
            return res.redirect('/v1/auth/google/failure');
        }
        
        const token = user.token;

        res.redirect(`${process.env.FRONTEND_URL}/verificacion?token=${token}`);
    })(req, res, next);
});
  
server.get('/google/success', (req, res, next) => {
    try {
        const { user } = req;
        if (!user) {
            throw new Error('No user found after authentication');
        }
        res.redirect(process.env.FRONTEND_URL + '/verificacion?_valid=' + user?._id);
    } catch (error) {
        next(error); // Maneja el error
    }
});

server.get('/google/failure', (req, res, next) => {
    try {
        res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
        next(error); // Maneja el error
    }
});


server.get('/google/logout', (req, res, next) => {
    res.redirect(`${process.env.FRONTEND_URL}/iniciar-sesion`);
});

module.exports = server;