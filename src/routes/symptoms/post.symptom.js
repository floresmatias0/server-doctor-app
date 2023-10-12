const server = require('express').Router();
const { createSymptom } = require('../../controllers/symptoms');

server.post('/',
    async (req, res) => {
        const data = req.body;

        try {
            await createSymptom(data);
            return res.status(200).json({
                success: true,
                data: 'Symptom created successfully'
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
