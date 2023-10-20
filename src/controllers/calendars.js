const Booking = require("../models/booking");
const { findPatientByEmail } = require("./patients");
const { findAllSymptoms } = require("./symptoms");
const { findUserByEmail, updateUser } = require("./users");
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');

const findAllBooking = async (filters) => {
    try {
        return await Booking.find(filters);
    }catch(err) {
        throw new Error(err.message);
    }
};

const findBookingById = async (bookingId) => {
    try {
        const booking = await Booking.findOne({_id: bookingId});
        if (!booking) {
            throw new Error('Booking not found');
        }
        return booking;
    } catch (err) {
        throw new Error('Error fetching booking by ID');
    }
};

const createBooking = async (bookingData) => {
    try {
        const { id, status, summary, organizer, start, end, hangoutLink, userId, symptoms } = bookingData;

        const doctor = await findUserByEmail(organizer.email);

        if(!doctor) {
            throw new Error(err.message);
        }

        const symptomsIds = []

        symptoms.split(',').forEach(async symptom => {
            let findSymptom = await findAllSymptoms({ name: symptom })
            if(findSymptom) symptomsIds.push(findSymptom._id)
        })

        return await Booking.create({
            booking_id: id,
            user_id: userId,
            status,
            summary,
            organizer: doctor,
            start,
            end,
            hangoutLink,
            symptoms: symptomsIds
        });
    }catch(err) {
        throw new Error(err.message);
    }
}

const updateBooking = async (id, bookingData) => {
    try {
        return await Booking.findOneAndUpdate({ _id: id }, bookingData);
    }catch(err) {
        throw new Error(err.message);
    }
}

const createEvent = async (doctorEmail, patientEmail, title, startDateTime, endDateTime, symptoms) => {
    try {
        const user = await findUserByEmail(doctorEmail);
        let patient = await findUserByEmail(patientEmail);
        
        if(!patient) {
            patient = await findPatientByEmail(patientEmail);
        }

        if (!user) {
            throw new Error("User not found")
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
            userId: patient._id,
            symptoms
        })

        return {
            success: true,
            data: response.data
        };
    } catch (err) {
        throw new Error(err.message)
    }
}

module.exports = {
    findAllBooking,
    findBookingById,
    createBooking,
    updateBooking,
    createEvent
};