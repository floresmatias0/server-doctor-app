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

        let dataRefactor = [];

        for(let i = 0; i < events.length; i++) {
            let obj = {}
            let patientId = events[i]?.patient;
            let patient = await findPatientById(patientId);

            obj.id = events[i]?._id;
            obj.bookingId = events[i]?.booking_id;

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
            obj.doctorPicture = events[i]?.organizer?.picture;
            obj.doctorPrice = events[i]?.organizer?.price;

            obj.status = events[i]?.status;
            obj.certificate = events[i]?.certificate;
            obj.details = events[i]?.details;

            dataRefactor.push(obj);
        }

        dataRefactor.sort((a, b) => new Date(b.originalStartTime) - new Date(a.originalStartTime))

        return res.status(200).json({
            success: true,
            data: dataRefactor
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


        let formatPatient = [];

        for(let i = 0; i < patients.length; i++) {
            let obj = {}
            let patient = patients[i];

            obj.patientId = patient?._id;
            obj.patientName = (patient?.firstName || patient?.lastName) ? `${patient?.firstName} ${patient?.lastName}` : patient?.name;
            obj.patientIdentityId = patient?.identityId
            obj.patientGenre = patient?.genre;
            obj.patientSocialWork = patient?.socialWork;
            obj.patientSocialWorkId = patient?.socialWorkId;
            obj.patientDocuments = patient?.documents;
            obj.patientProceedings = patient?.proceedings;
            obj.patientDateOfBirth = new Date(patient?.dateOfBirth).toLocaleDateString();
            obj.patientPhone = patient?.phone

            obj.tutorId = patient?.userId?._id;
            obj.tutorName = (patient?.userId?.firstName || patient?.userId?.lastName) ? `${patient?.userId?.firstName} ${patient?.userId?.lastName}` : patient?.userId?.name;
            obj.tutorEmail = patient?.userId?.email;
            obj.tutorPhone = patient?.userId?.phone;

            formatPatient.push(obj);
        }

        return res.status(200).json({
            success: true,
            data: formatPatient
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

//IMPLEMENTACIÓN TURNO MÁS PRÓXIMO

const adjustTime = (dateString, offsetHours) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + offsetHours); // Ajuste de tiempo
    return date;
};

const getAvailableSlots = (user, occupiedSlots) => {
    const availableSlots = [];
    const currentTime = new Date();
    const slotDuration = user.reserveTime; // Duración del turno, por ejemplo 30 minutos

    const addSlot = (date, startHour, endHour) => {
        console.log(`Procesando franja horaria: date=${date}, startHour=${startHour}, endHour=${endHour}`);

        let start = new Date(date);
        start.setHours(parseInt(startHour), 0, 0, 0);
        let end = new Date(date);
        end.setHours(parseInt(endHour), 0, 0, 0);

        console.log(`Inicializando start=${start}, end=${end}`);
        while (start < end) {
            const slotEnd = new Date(start);
            slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration); // Usar reserveTime para la duración del turno
            const overlap = occupiedSlots.some(slot => {
                console.log(`Verificando solapamiento para: start=${start}, end=${slotEnd}`);
                console.log(`Occupied slot: start=${slot.start}, end=${slot.end}`);
                const overlapCheck = start < slot.end && slot.start < slotEnd;
                if (overlapCheck) console.log(`Solapamiento detectado: start=${start}, end=${slotEnd}, ocupado=${slot}`);
                return overlapCheck;
            });
            if (!overlap) {
                availableSlots.push({ start: start, end: slotEnd });
                console.log(`Franja horaria disponible añadida: start=${start}, end=${slotEnd}`);
            } else {
                console.log(`Solapamiento: start=${start}, end=${slotEnd}`);
            }
            start = slotEnd;
        }
    };

    for (let i = 0; i < 14; i++) { // Revisa las próximas dos semanas
        const date = new Date(currentTime);
        date.setDate(date.getDate() + i);
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0 && user.reserveSunday) {
            console.log(`Omitiendo domingo: ${date}`);
            continue;
        }
        if (dayOfWeek === 6 && user.reserveSaturday) {
            console.log(`Omitiendo sábado: ${date}`);
            continue;
        }

        // Añadir horarios laborales del médico
        if (user.reserveTimeFrom && user.reserveTimeUntil) {
            addSlot(date, user.reserveTimeFrom, user.reserveTimeUntil);
        }
        if (user.reserveTimeFrom2 && user.reserveTimeUntil2) {
            addSlot(date, user.reserveTimeFrom2, user.reserveTimeUntil2);
        }
    }

    console.log(`Total available slots: ${availableSlots.length}`);
    return availableSlots.filter(slot => slot.start >= currentTime); // Filtra los slots pasados
};


server.get('/closest-appointments', async (req, res) => {
    try {
        const { specialization } = req.query;
        
        console.log(`Buscando médicos con la especialización: ${specialization}`);
        const response = await axios.get(`${process.env.BACKEND_URL}/users?filters={"role":["DOCTOR"], "especialization":["${specialization}"]}`);
        const doctors = response.data.data;

        console.log(`Médicos encontrados: ${doctors.length}`);

        if (!doctors.length) {
            return res.status(404).json({
                success: false,
                error: "No doctors found for this specialization"
            });
        }

        let appointments = [];
        for (const doctor of doctors) {
            const user = await findUserByEmail(doctor.email);

            console.log(`Autenticando para el médico: ${doctor.email}`);
            const auth = new google.auth.OAuth2({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            });

            auth.setCredentials({ refresh_token: user.refreshToken });

            const refreshedTokens = await auth.refreshAccessToken();

            if (refreshedTokens.credentials.access_token) {
                await updateUser(user._id, { accessToken: refreshedTokens.credentials.access_token });
                auth.setCredentials({ access_token: refreshedTokens.credentials.access_token });
            }

            const calendar = google.calendar('v3');
            const timeMin = new Date().toISOString();

            console.log(`Obteniendo eventos del calendario para el médico: ${doctor.email}`);
            const calendarResponse = await calendar.events.list({
                auth,
                calendarId: 'primary',
                timeMin,
                singleEvents: true,
                orderBy: 'startTime'
            });

            // Ajustar las fechas del evento restando 3 horas
            const occupiedSlots = calendarResponse.data.items.map(event => ({
                start: new Date(event.start.dateTime),  // Usamos directamente la fecha original para la comparación
                end: new Date(event.end.dateTime)       // Usamos directamente la fecha original para la comparación
            }));

            console.log('Eventos ocupados:', occupiedSlots);

            const availableSlots = getAvailableSlots(user, occupiedSlots);

            console.log('Available Slots:', availableSlots);

            if (availableSlots.length > 0) {
                // Ajustamos la hora después de haber hecho la comparación
                const adjustedAvailableSlots = availableSlots.map(slot => ({
                    start: adjustTime(slot.start, -3),
                    end: adjustTime(slot.end, -3)
                }));

                // Enviar fechas como ISO strings al frontend
                appointments.push({
                    doctor: doctor,
                    nextAvailable: {
                        start: adjustedAvailableSlots[0].start.toISOString(),
                        end: adjustedAvailableSlots[0].end.toISOString()
                    } // Primer horario disponible
                });
            } else {
                console.log(`No hay horarios disponibles para el médico: ${doctor.email}`);
            }
        }

        return res.status(200).json({
            success: true,
            data: appointments
        });

    } catch (err) {
        console.error("Error fetching closest appointments", err.message);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

//FIN DE TURNO MAS PROXIMO

module.exports = server;