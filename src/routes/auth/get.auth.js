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
        next(error); // Pasa el error al middleware de manejo de errores de Express
    }
}


// Ruta para iniciar la autenticación con Google
server.get('/google/', defineGoogleScope, (req, res, next) => {
    try {
        passport.authenticate('google', {
            scope: req.googleScope,
            accessType: 'offline',
            prompt: 'consent',
            state: req.query.role,
            passReqToCallback: true
        })(req, res, next);
    } catch (error) {
        next(error); // Maneja el error
    }
});

server.get('/google/callback', (req, res, next) => {
    try {
        passport.authenticate('google', {
            successRedirect: '/v1/auth/google/success',
            failureRedirect: '/v1/auth/google/failure'
        })(req, res, next);
    } catch (error) {
        next(error); // Maneja el error
    }
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
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log('Error al destruir la sesión:', err);
                throw new Error("No se pudo destruir la sesión");
            }
            res.clearCookie('connect.sid', { path: '/' });
            res.redirect(`${process.env.FRONTEND_URL}/iniciar-sesion`); // Redirigir después de cerrar sesión
        });
    } catch (error) {
        next(error); // Maneja el error
    }
});

module.exports = server;