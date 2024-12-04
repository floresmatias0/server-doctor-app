const server = require('express').Router();
const { findAllSymptoms } = require('../../controllers/symptoms');

server.get('/', async (req, res) => {
    const { filters } = req.query
    let parseFilters = {}

    if(filters) {
        parseFilters = JSON.parse(filters);
    }

    try {
        const symptoms = await findAllSymptoms(parseFilters);

        return res.status(200).json({
            success: true,
            data: symptoms
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
