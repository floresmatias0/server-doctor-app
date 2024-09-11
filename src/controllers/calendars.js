const Booking = require("../models/booking");
const { findUserByEmail, updateUser } = require("./users");
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongoose').Types;

const findAllBooking = async (filters) => {
    try {
        return await Booking.find(filters).populate('patient').populate('certificate').populate('symptoms');
    }catch(err) {
        console.log(err)
        throw new Error(err.message);
    }
};

const findBookingById = async (bookingId) => {
    try {
        const booking = await Booking.findOne({_id: new ObjectId(bookingId)});
        if (!booking) {
            throw new Error('Booking not found');
        }
        return booking;
    } catch (err) {
        console.log(err)
        throw new Error('Error fetching booking by ID');
    }
};

const createBooking = async (bookingData) => {
    try {
        const { id, status, summary, organizer, start, end, hangoutLink, userId, symptoms, patient, order_id } = bookingData;

        const doctor = await findUserByEmail(organizer.email);

        if(!doctor) {
            throw new Error(err.message);
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
            patient
        });
    }catch(err) {
        throw new Error(err.message);
    }
}

const updateBooking = async (id, bookingData) => {
    try {
        const booking = await Booking.findOneAndUpdate(new ObjectId(id), bookingData)
        booking.save();
        return booking
    }catch(err) {
        throw new Error(err.message);
    }
}

const createEvent = async (doctorEmail, tutorEmail, title, startDateTime, endDateTime, symptoms, patient, order_id) => {
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

        await createBooking({
            ...response?.data,
            order_id,
            start: {
                dateTime: startDateTime,
                timeZone: 'America/Argentina/Buenos_Aires'
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'America/Argentina/Buenos_Aires'
            },
            userId: user._id,
            symptoms,
            patient
        })

        return {
            success: true,
            data: response?.data
        };
    } catch (err) {
        let msg = JSON.stringify({
            section: "createEvent",
            errors: err?.response?.data?.error?.errors,
            code: err?.response?.data?.error?.code,
            message: err?.response?.data?.error?.message
        })

        throw new Error(msg)
    }
}

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
    getChartsBookings
};