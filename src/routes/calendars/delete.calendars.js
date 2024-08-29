const server = require('express').Router();
const { google } = require('googleapis');
const { findUserByEmail, updateUser } = require('../../controllers/users');
const { updateBooking, findBookingById } = require('../../controllers/calendars');
const { v4: uuidv4 } = require('uuid');
const { getPayment } = require('../../controllers/payments');
const axios = require('axios');

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

        // const access_token = 'APP_USR-3936245486590128-040611-54994be7d12fb4d622883318476340ee-1467206734'
        const access_token = user?.mercadopago_access?.access_token;

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
            auth: auth,
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

            const payment = await getPayment({merchant_order_id: booking?.order_id});

            const randomString = uuidv4();  
            const responsePayment = await axios.request({
                method: 'POST',
                url: `https://api.mercadopago.com/v1/payments/${payment?.payment_id}/refunds?access_token=${access_token}`,
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': randomString
                }
            });

            console.log('event deleted response', response, responsePayment?.data);
            return res.status(200).json({
                success: true,
                data: 'Cancelación exito'
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
