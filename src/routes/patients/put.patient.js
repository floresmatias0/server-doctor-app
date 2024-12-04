const server = require('express').Router();
const { updatePatient } = require('../../controllers/patients');

server.put('/:id', async (req, res) => {
        const { id } = req.params;
        const data = req.body;

        try {
            await updatePatient(id, data);
            
            return res.status(200).json({
                success: true,
                data: 'Patient updated successfully'
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