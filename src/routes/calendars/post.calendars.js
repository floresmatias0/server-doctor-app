const server = require('express').Router();
const { createEvent } = require('../../controllers/calendars');

server.post('/create-event', async (req, res) => {
    try {
        const { doctorEmail, userEmail, title = 'Consulta médica', startDateTime, endDateTime, patient } = req.body;

        const response = await createEvent(doctorEmail, userEmail, title, startDateTime, endDateTime, patient)

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
        if(typeof(err.message) === "string") {
            let msg = JSON.parse(err.message)
            
            return res.status(msg.code).json({
                success: false,
                error: msg
            });
        }

        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
