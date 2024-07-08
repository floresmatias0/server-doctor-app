const server = require('express').Router();
const { google } = require('googleapis');
const { findUserByEmail, updateUser } = require('../../controllers/users');
const { findAllBooking, getChartsBookings } = require('../../controllers/calendars');
const { findPatientById } = require('../../controllers/patients');

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

        const timeMin = new Date().toISOString();

        calendar.events.list({ 
            auth,
            calendarId: 'primary',
            timeMin,
            singleEvents: true, // Asegura que los eventos recurrentes se devuelvan como instancias únicas
            orderBy: 'startTime' // Ordena los eventos por hora de inicio
        }, (err, response) => {

            if (err) {
                console.log(err)
                return res.status(500).json({
                    success: false,
                    error: err.message + " try again"
                });
            }

            return res.status(200).json({
                success: true,
                data: response.data
            });
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

server.get('/all-events/:id?', async (req, res) => {
    try {
        const { id } = req.params;
        const { doctor } = req.query;

        let events = [];

        if (!id && doctor) {
            events = await findAllBooking({ 'organizer.email': `${doctor}` });
        } else {
            events = await findAllBooking({ 'user_id': id });
        }

        const eventPromises = events.map(async (event) => {
            const patientId = event?.patient;
            if (patientId) {
                const patient = await findPatientById(patientId);
                event.patient = patient; // Asigna el paciente al evento
            }

            return event;
        });

        const eventsWithPatients = await Promise.all(eventPromises);
        eventsWithPatients.sort((a, b) => new Date(b.start.dateTime) - new Date(a.start.dateTime));

        return res.status(200).json({
            success: true,
            data: eventsWithPatients
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

server.get('/doctor-patients/:doctorEmail', async (req, res) => {
    try {
        const { doctorEmail } = req.params;
        if (!doctorEmail) {
            return res.status(400).json({
                success: false,
                error: 'Doctor email is required'
            });
        }

        // Obtener todas las reservas del doctor especificado
        const events = await findAllBooking({ 'organizer.email': doctorEmail });

        // Crear un Set para almacenar los IDs únicos de los pacientes
        const patientIds = new Set();

        // Recorrer las reservas y agregar los IDs de los pacientes al Set
        events.forEach(event => {
            if (event.patient) {
                patientIds.add(event.patient);
            }
        });

        // Convertir el Set a un array para obtener los datos de los pacientes
        const uniquePatientIds = Array.from(patientIds);

        // Obtener la información de los pacientes
        const patientPromises = uniquePatientIds.map(patientId => findPatientById(patientId));
        const patients = await Promise.all(patientPromises);

        return res.status(200).json({
            success: true,
            data: patients
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

server.get('/charts-booking', async (req, res) => {
    try {
        const dates = await getChartsBookings();

        return res.status(200).json({
            success: true,
            data: dates
        });
    }catch(err) {
        console.log(err.message)
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

module.exports = server;