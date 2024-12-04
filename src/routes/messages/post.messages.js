const server = require('express').Router();
const { reservedShift } = require('../../controllers/messages');

server.post('/', async (req, res) => {
    try {

        const data = await reservedShift(
            'matiflores50@gmail.com',
            true,
            'Tiene un nuevo turno agendado.',
            'Juan Perez',
            'Matias Rodriguez',
            'Pediatra especialista en desarrollo',
            '14 diciembre 2025, 16:00 HS.',
            15000,
            'bookingIdTest',
            'doctorEmail@test.com'
        )

        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;