const server = require('express').Router();
const { deleteSpecialization } = require('../../controllers/specializations');

server.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deleteSpecialization(id);
        return res.status(200).json({
            success: true,
            message: "Especialización eliminada con éxito"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
