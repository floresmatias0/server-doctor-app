const server = require('express').Router();
const { google } = require('googleapis');
const { findUserByEmail, updateUser } = require('../../controllers/users');
const { v4: uuidv4 } = require('uuid');
const { createBooking } = require('../../controllers/calendars');

server.post('/create-event', async (req, res) => {
    try {
        const { doctorEmail, patientEmail, title, startDateTime, endDateTime } = req.body;

        const user = await findUserByEmail(doctorEmail);
        const patient = await findUserByEmail(patientEmail)

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found"
            });
        }

        const auth = new google.auth.OAuth2({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        });

        auth.setCredentials({ refresh_token: user.refreshToken });

        const refreshedTokens = await auth.refreshAccessToken();

        if (refreshedTokens.credentials.access_token) {
            await updateUser(user._id, { accessToken: refreshedTokens.credentials.access_token });
        }

        const calendar = google.calendar('v3');
        const randomString = uuidv4();

        const event = {
            summary: title,
            start: {
                dateTime: startDateTime,
                timeZone: 'America/Argentina/Buenos_Aires'
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'America/Argentina/Buenos_Aires'
            },
            attendees: [
                {'email': doctorEmail },
                {'email': patientEmail }
            ],
            conferenceData: {
                createRequest: { requestId: randomString }
            },
            'reminders': {
                'useDefault': true
            }
        };

        const response = await calendar.events.insert({
            auth,
            calendarId: 'primary',
            resource: event,
            sendNotifications: true,
            conferenceDataVersion: 1
        });

        await createBooking({
            ...response.data,
            userId: patient._id
        })

        return res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
