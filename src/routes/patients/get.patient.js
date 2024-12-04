const server = require('express').Router();
const { findAllPatients, findPatientById } = require('../../controllers/patients');

server.get('/',
    async (req, res) => {
        const { filters } = req.query
        let parseFilters = {}

        if(filters) {
            parseFilters = JSON.parse(filters);
        }

        try {
            const patients = await findAllPatients(parseFilters);

            return res.status(200).json({
                success: true,
                data: patients
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
);

server.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const patient = await findPatientById(id);
        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;