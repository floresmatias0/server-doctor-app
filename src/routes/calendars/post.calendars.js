const server = require('express').Router();
const { createEvent } = require('../../controllers/calendars');

server.post('/create-event', async (req, res) => {
    try {
        const { doctorEmail, patientEmail, title, startDateTime, endDateTime, patient } = req.body;

        const response = await createEvent(doctorEmail, patientEmail, title, startDateTime, endDateTime, patient)

        if(!response) {
            return res.status(500).json({
                success: false,
                error: "User not found"
            });
        }

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

module.exports = server;
