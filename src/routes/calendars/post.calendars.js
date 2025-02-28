const server = require('express').Router();
const { createEvent } = require('../../controllers/calendars');

server.post('/create-event', async (req, res) => {
    try {
        const { doctorEmail, tutorEmail, title = 'Consulta médica', startDateTime, endDateTime, patient } = req.body;

        console.log("Datos recibidos:", req.body);

        const response = await createEvent(doctorEmail, tutorEmail, title, startDateTime, endDateTime, [], patient);

        if (!response) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (err) {
        console.error("Error en createEvent:", err.message);

        let statusCode = 500;
        let errorMessage = "Internal Server Error";

        if (typeof err.message === "string") {
            try {
                let msg = JSON.parse(err.message);
                statusCode = msg.code || 500;
                errorMessage = msg.message || "Internal Server Error";
            } catch (parseError) {
                console.error("Error parsing error message:", parseError);
            }
        }

        return res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
});

module.exports = server;
