const Booking = require("../models/booking");
const { findUserByEmail, updateUser } = require("./users");
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');

const findAllBooking = async (query) => {
  return await Booking.find(query)
    .populate('patient')
    .populate('certificate')
    .populate({
      path: 'rating',
      model: 'Rating',
      select: 'rating comment', // Seleccionar solo los campos necesarios
    });
};

const findBookingById = async (bookingId) => {
  try {
    const booking = await Booking.findOne({ _id: new ObjectId(bookingId) });
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  } catch (err) {
    console.log(err)
    throw new Error('Error fetching booking by ID');
  }
};

const findBookingByBookingId = async (bookingId) => {
  try {
    const booking = await Booking.findOne({ booking_id: bookingId });
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  } catch (err) {
    console.log(err);
    throw new Error('Error fetching booking by booking_id');
  }
};


const createBooking = async (bookingData) => {
  try {
    const { id, status, summary, organizer, start, end, hangoutLink, userId, symptoms, patient, order_id } = bookingData;

    const doctor = await findUserByEmail(organizer.email);

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return await Booking.create({
      order_id,
      booking_id: id,
      user_id: userId,
      status,
      summary,
      organizer: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        picture: doctor.picture,
        price: doctor.reservePrice,
        time: doctor.reserveTime
      },
      start,
      end,
      hangoutLink,
      symptoms,
      patient,
      customBookingIdField: id,
      rating: null // Asegúrate de que el campo rating esté presente aunque inicialmente vacío
    });
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateBooking = async (id, bookingData) => {
  try {
    const booking = await Booking.findOneAndUpdate(new ObjectId(id), bookingData)
    booking.save();
    return booking
  } catch (err) {
    throw new Error(err.message);
  }
}

const createEvent = async (doctorEmail, tutorEmail, title, startDateTime, endDateTime, symptoms, patient, order_id) => {
  try {
    console.log("Inicio de createEvent");

    const doctor = await findUserByEmail(doctorEmail);
    if (!doctor) {
      console.log("Doctor not found:", doctorEmail);
      throw new Error("Doctor not found");
    }

    console.log("Doctor encontrado:", doctor);

    let user = await findUserByEmail(tutorEmail);
    if (!user) {
      console.log("User not found:", tutorEmail);
      user = { email: tutorEmail, name: patient.tutorName }; // Crear un objeto de usuario básico si no se encuentra
    }

    console.log("Usuario encontrado o creado:", user);

    const auth = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    auth.setCredentials({ refresh_token: doctor.refreshToken });
    console.log("Credenciales configuradas para OAuth2");

    const refreshedTokens = await auth.refreshAccessToken();
    if (refreshedTokens.credentials.access_token) {
      await updateUser(doctor._id, { accessToken: refreshedTokens.credentials.access_token });
    }

    const calendar = google.calendar('v3');
    const randomString = uuidv4();
    console.log("Configurando el evento en Google Calendar");

    const event = {
      summary: title,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      attendees: [
        { email: doctorEmail },
        { email: tutorEmail },
      ],
      conferenceData: {
        createRequest: { requestId: randomString },
      },
      reminders: {
        useDefault: true,
      },
    };

    console.log("Datos del evento:", event);

    const response = await calendar.events.insert({
      auth,
      calendarId: 'primary',
      resource: event,
      sendNotifications: true,
      conferenceDataVersion: 1,
    });

    console.log("Evento creado en Google Calendar:", response.data);

    // Verificar si la reserva es creada por un médico o paciente
    const isDoctorCreating = doctorEmail === tutorEmail;

    // Log de los datos de la reserva
    const bookingData = {
      _id: new mongoose.Types.ObjectId(),
      customBookingIdField: response.data.id,
      order_id,
      booking_id: response.data.id,
      user_id: isDoctorCreating ? null : user._id,
      status: 'pending', // Establecer siempre como 'pending'
      summary: title,
      organizer: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        picture: doctor.picture,
        price: doctor.reservePrice,
        time: doctor.reserveTime,
      },
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      originalStartTime: startDateTime,
      hangoutLink: response.data.hangoutLink,
      symptoms,
      patient: isDoctorCreating ? null : user._id, // Usar el ObjectId del usuario si no es creado por un médico
      patientInfo: {
        name: patient.name,
        tutorName: patient.tutorName,
        email: patient.email
      },
    };

    console.log("Datos de la reserva para crear:", bookingData);

    const booking = await Booking.create(bookingData);
    console.log("Reserva creada en la base de datos:", booking);

    return {
      success: true,
      booking_id: booking.booking_id, // Asegúrate de retornar el booking_id correcto
      data: response.data,
    };
  } catch (err) {
    console.error("Error en createEvent:", err.message);

    let msg = JSON.stringify({
      section: "createEvent",
      errors: err?.response?.data?.error?.errors || [],
      code: err?.response?.data?.error?.code || 500,
      message: err?.response?.data?.error?.message || err.message,
    });

    throw new Error(msg);
  }
};


const getDaysOfCurrentMonth = () => {
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  const daysOfTheMonth = [];
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    daysOfTheMonth.push(day.toString().padStart(2, '0'));
  }

  return {
    firstDayOfMonth: firstDayOfMonth,
    lastDayOfMonth: lastDayOfMonth,
    daysOfTheMonth: daysOfTheMonth
  };
};

const getBookingsCountByDay = async () => {
  const { firstDayOfMonth, lastDayOfMonth } = getDaysOfCurrentMonth();

  const bookingDays = [];
  const countsByDay = [];

  let currentDate = new Date(firstDayOfMonth);
  while (currentDate <= lastDayOfMonth) {
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

    const bookingsCount = await Booking.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    countsByDay.push(bookingsCount);
    bookingDays.push(startOfDay.toISOString().substring(0, 10));

    // Increment currentDate to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Aggregate bookings by month and year
  const bookingStats = await Booking.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalReservations: { $sum: 1 },
        totalPrice: { $sum: '$organizer.price' }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    }
  ]);

  // Get the current year
  const currentYear = new Date().getFullYear();

  // Calculate total revenue for the current year (from January to the current month)
  const totalRevenueCurrentYear = bookingStats
    .filter(stats => stats._id.year === currentYear)
    .reduce((acc, stats) => acc + stats.totalPrice, 0);

  // Get the revenue for the current month
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthRevenue = bookingStats.find(stats =>
    stats._id.month === currentMonth && stats._id.year === currentYear)?.totalPrice || 0;

  return {
    bookingDays,
    countsByDay,
    bookingStats,
    totalRevenueAllMonths: totalRevenueCurrentYear,
    currentMonthRevenue
  };
};

const getChartsBookings = async () => {
  try {
    return await getBookingsCountByDay();
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  findAllBooking,
  findBookingById,
  createBooking,
  updateBooking,
  createEvent,
  getChartsBookings,
  findBookingByBookingId
};