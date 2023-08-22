const passport = require('passport')
const server = require('express').Router();

server.get('/', passport.authenticate('google', {
    scope: [ 'email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events' ],
    accessType: 'offline',
    prompt: 'consent',
}));

server.get('/callback',
    passport.authenticate('google', {
        successRedirect: '/v1/auth/google/success',
        failureRedirect: '/v1/auth/google/failure'
    }
));

server.get('/success', (req, res) => {
    const { user } = req.session.passport;
    res.redirect(process.env.FRONTEND_URL + '?_valid=' + user?._id);
});

server.get('/failure', (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
});

module.exports = server;