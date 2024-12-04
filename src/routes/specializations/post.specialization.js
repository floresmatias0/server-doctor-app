const server = require('express').Router();
const { createSpecialization } = require('../../controllers/specializations');

server.post('/', async (req, res) => {
    const data = req.body;
    try {
        await createSpecialization(data);
        return res.status(200).json({
            success: true,
            data: 'Especialización creada con éxito'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
