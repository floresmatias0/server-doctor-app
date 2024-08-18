const server = require('express').Router();
const { deleteSymptom } = require('../../controllers/symptoms');

server.delete('/:id', async (req, res) => {
        const { id } = req.params;

        try {
            await deleteSymptom(id);
            
            return res.status(200).json({
                success: true,
                message: "Sintoma eliminado con exito"
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