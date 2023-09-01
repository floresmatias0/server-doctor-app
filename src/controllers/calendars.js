const Booking = require("../models/booking");
const { findUserByEmail } = require("./users");

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
        const { id, status, summary, organizer, start, end, hangoutLink, userId } = bookingData;

        const doctor = await findUserByEmail(organizer.email);

        if(!doctor) {
            throw new Error(err.message);
        }

        return await Booking.create({
            booking_id: id,
            user_id: userId,
            status,
            summary,
            organizer: doctor,
            start,
            end,
            hangoutLink
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

module.exports = {
    findAllBooking,
    findBookingById,
    createBooking,
    updateBooking
};