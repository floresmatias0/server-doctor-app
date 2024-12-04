const server = require('express').Router();
const { deleteUser } = require('../../controllers/users');

server.delete('/:id', async (req, res) => {
        const { id } = req.params;

        try {
            await deleteUser(id);
            
            return res.status(200).json({
                success: true,
                message: "Usuario eliminado con exito"
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