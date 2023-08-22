const server = require('express').Router();
const { findUserById } = require('../../controllers/users');

server.put('/:id', async (req, res) => {
        const { id } = req.params;
        const data = req.body;

        try {
            const user = await findUserById(id);
             
            return res.status(200).json({
                success: true,
                data: 'User updated successfully'
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