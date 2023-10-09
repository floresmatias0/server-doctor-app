const server = require('express').Router();
const { createPatient } = require('../../controllers/patients');

server.post('/',
    async (req, res) => {
        const data = req.body;

        try {
            await createPatient(data);
            return res.status(200).json({
                success: true,
                data: 'Patient created successfully'
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
);

module.exports = server;