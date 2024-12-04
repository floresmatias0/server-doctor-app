const { getStorage, ref, deleteObject } = require("firebase/storage");
const { findBookingById, updateBooking } = require("../../controllers/calendars");
const { ObjectId } = require('mongoose').Types;

const server = require('express').Router();

const storage = getStorage();

server.post('/file/delete', async (req, res) => {
    try {
        const { body } = req;

        const desertRef = ref(storage, `files/${body?.file?.fileName}`);

        const response = await deleteObject(desertRef);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

server.delete('/booking/:certificateId', async (req, res) => {
    try {
        const { bookingId } = req.query
        const { certificateId } = req.params

        if (bookingId && certificateId) {
            const booking = await findBookingById(bookingId);
            const filterCertificates = booking.certificate.filter(x => !x.equals(new ObjectId(certificateId)));

            const bookintUpdated = await updateBooking(bookingId, { certificate: filterCertificates })

            return res.status(200).json({
                success: true,
                data: bookintUpdated
            });
        }
 
        return res.status(500).json({
            success: false,
            error: 'bookingId or certificateId missing'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;