const server = require('express').Router();
const { google } = require('googleapis');
const { findUserByEmail, updateUser } = require('../../controllers/users');
const { findAllBooking } = require('../../controllers/calendars');

server.get('/', async (req, res) => {
    try {
        const { email } = req.query;

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found"
            });
        }

        // Crear una instancia OAuth2 con las credenciales y el refreshToken
        const auth = new google.auth.OAuth2({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        });

        auth.setCredentials({ refresh_token: user.refreshToken });
        // Actualizar el token de acceso utilizando el refreshToken
        const refreshedTokens = await auth.refreshAccessToken();

        // Actualizar el token de acceso en tu base de datos
        if (refreshedTokens.credentials.access_token) {
            await updateUser(user._id, { accessToken: refreshedTokens.credentials.access_token });
        }

        const calendar = google.calendar('v3');

        calendar.events.list({ auth, calendarId: 'primary' }, (err, response) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message + " try again"
                });
            }
            // Aquí puedes manejar la respuesta de la API de Google Calendar
            // response.data contiene los datos de los eventos, por ejemplo
            return res.status(200).json({
                success: true,
                data: response.data
            });
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

server.get('/all-events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const events = await findAllBooking({ 'user_id': id })

        return res.status(200).json({
            success: true,
            data: events
        });
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

module.exports = server;