const server = require('express').Router();
const { google } = require('googleapis');
const { findUserByEmail, updateUser } = require('../../controllers/users');
const { findAllBooking, getChartsBookings, findBookingById, updateBooking } = require('../../controllers/calendars');
const { findPatientById } = require('../../controllers/patients');
const axios = require('axios');
const { getPayment } = require('../../controllers/payments');
const { v4: uuidv4 } = require('uuid');

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

        let extraData = [];

        for(let i = 0; i < events.length; i++) {
            let obj = {}
            let patientId = events[i]?.patient;
            let patient = await findPatientById(patientId);

            obj.patientId = patient?._id;
            obj.patientName = (patient?.firstName || patient?.lastName) ? `${patient?.firstName} ${patient?.lastName}` : patient?.name;
            obj.patientGenre = patient?.genre;
            obj.patientSocialWork = patient?.socialWork;
            obj.patientSocialWorkId = patient?.socialWorkId;
            obj.patientDocuments = patient?.documents;
            obj.patientProceedings = patient?.proceedings;

            obj.tutorId = patient?.userId?._id;
            obj.tutorName = (patient?.userId?.firstName || patient?.userId?.lastName) ? `${patient?.userId?.firstName} ${patient?.userId?.lastName}` : patient?.userId?.name;
            obj.tutorEmail = patient?.userId?.email;
            obj.tutorPhone = patient?.userId?.phone;
            
            let beginning = new Date(events[i]?.start?.dateTime).toLocaleString("es", {day: "numeric", month: "numeric", year: "numeric"});
            obj.beginning = beginning;
            let startTime = new Date(events[i]?.start?.dateTime).toLocaleString("es", {hour: "numeric", minute: "numeric"});
            obj.startTime = startTime;

            obj.originalStartTime = events[i]?.start?.dateTime;

            obj.status = events[i]?.status;
            obj.link = events[i]?.hangoutLink;

            obj.symptoms = events[i]?.symptoms?.map(u => u.name).join(', ');
            
            obj.doctorId = events[i]?.organizer?._id;
            obj.doctorName = events[i]?.organizer?.name;
            obj.doctorEmail = events[i]?.organizer?.email;

            extraData.push(obj);
        }

        const eventPromises = events.map(async (event) => {
            const patientId = event?.patient;

            if (patientId) {
                const patient = await findPatientById(patientId);

                event.patient = patient;
            }

            return event;
        });

        const eventsWithPatients = await Promise.all(eventPromises);
        eventsWithPatients.sort((a, b) => new Date(b.start.dateTime) - new Date(a.start.dateTime));
        extraData.sort((a, b) => new Date(b.originalStartTime) - new Date(a.originalStartTime))

        return res.status(200).json({
            success: true,
            extraData,
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
});

server.get('/cancelation/:id', async (req, res) => {
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