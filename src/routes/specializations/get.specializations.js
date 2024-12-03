const server = require('express').Router();
const { findAllSpecializations } = require('../../controllers/specializations');

server.get('/', async (req, res) => {
    console.log('entra a get especialidades')
    const { filters } = req.query;
    let parseFilters = {};
    if (filters) {
        parseFilters = JSON.parse(filters);
    }
    console.log(`FIltros: ${filters}`)
    console.log(`parseFilters: ${parseFilters}`)
    try {
        const specializations = await findAllSpecializations(parseFilters);
        return res.status(200).json({
            success: true,
            data: specializations
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
