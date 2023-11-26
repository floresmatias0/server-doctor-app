const Booking = require("../models/booking");
const { findAllSymptoms } = require("./symptoms");
const { findUserByEmail, updateUser } = require("./users");
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');

const findAllBooking = async (filters) => {
    try {
        return await Booking.find(filters).populate('patient').populate('certificate');
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
        const { id, status, summary, organizer, start, end, hangoutLink, userId, symptoms, patient } = bookingData;

        const doctor = await findUserByEmail(organizer.email);

        if(!doctor) {
            throw new Error(err.message);
        }

        const symptomsIds = [];

        const symptomsArray = symptoms.split(',');

        for (const symptom of symptomsArray) {
            const findSymptom = await findAllSymptoms({ name: symptom });

            if (findSymptom) {
                symptomsIds.push(findSymptom._id);
            }
        }

        return await Booking.create({
            booking_id: id,
            user_id: userId,
            status,
            summary,
            organizer: doctor,
            start,
            end,
            hangoutLink,
            symptoms: symptomsIds,
            patient
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

const createEvent = async (doctorEmail, tutorEmail, title, startDateTime, endDateTime, symptoms, patient) => {
    try {
        const doctor = await findUserByEmail(doctorEmail);
        let user = await findUserByEmail(tutorEmail);
        
        if(!user) {
            throw new Error("User not found")
        }

        if (!doctor) {
            throw new Error("User not found")
        }

        const auth = new google.auth.OAuth2({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        });

        auth.setCredentials({ refresh_token: doctor.refreshToken });

        const refreshedTokens = await auth.refreshAccessToken();

        if (refreshedTokens.credentials.access_token) {
            await updateUser(doctor._id, { accessToken: refreshedTokens.credentials.access_token });
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
                {'email': tutorEmail }
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

        console.log({ data: response.data })
        await createBooking({
            ...response.data,
            userId: user._id,
            symptoms,
            patient
        })

        return {
            success: true,
            data: response.data
        };
    } catch (err) {
        let msg = JSON.stringify({
            section: "createEvent",
            errors: err.response.data.error.errors,
            code: err.response.data.error.code,
            message: err.response.data.error.message
        })

        throw new Error(msg)
    }
}

module.exports = {
    findAllBooking,
    findBookingById,
    createBooking,
    updateBooking,
    createEvent
};