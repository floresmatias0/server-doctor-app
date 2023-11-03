const { updateBooking } = require('../../controllers/calendars');
const { createCertificate } = require('../../controllers/certificates');

const server = require('express').Router();

server.post('/uploads', async (req, res) => {
    try {
        const { doctorId, patientId, bookingId } = req.body
        const files = req.files;

        if (doctorId && patientId) {
            const createPromises = files.map(async (file) => {
                const certificate = await createCertificate({ filename: file.filename, patientId, doctorId });
                return certificate._id;
            });
            
            const certificatesIds = await Promise.all(createPromises);
            await updateBooking(bookingId, { certificate: certificatesIds })

            return res.status(200).json({
                success: true,
                data: files
            });
        }
 
        return res.status(500).json({
            success: false,
            error: 'DoctorId or PatientId missing'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
