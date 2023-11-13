const server = require('express').Router();
const { google } = require('googleapis');
const { findUserByEmail, updateUser } = require('../../controllers/users');
const { updateBooking, findBookingById } = require('../../controllers/calendars');

server.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.query;

        const user = await findUserByEmail(email);
        const booking = await findBookingById(id);

        if (!user || !booking) {
            return res.status(401).json({
                success: false,
                error: `${!user ? 'User' : 'Booking'} User not found`
            });
        }

        const auth = new google.auth.OAuth2({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        });

        auth.setCredentials({ refresh_token: user.refreshToken });

        const refreshedTokens = await auth.refreshAccessToken();

        if (refreshedTokens.credentials.access_token) {
            const accessToken = refreshedTokens.credentials.access_token;

            await updateUser(user._id, { accessToken })
            auth.setCredentials({ access_token: accessToken });
        }

        const calendar = google.calendar('v3');

        await calendar.events.delete({
            calendarId: 'primary', // ID del calendario (puedes usar 'primary' para el calendario principal)
            eventId: booking.booking_id,
          }, async (err, response) => {
            if (err) {
                console.error('Error al eliminar el evento:', err);
                return res.status(500).json({
                    success: false,
                    error: err
                });
            }

            console.log('Evento eliminado con éxito:', id);
            await updateBooking(booking._id, {
                status: 'deleted'
            })

            console.log('event deleted response', response);
            return res.status(200).json({
                success: true,
                data: 'Borrado con exito'
            });
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
