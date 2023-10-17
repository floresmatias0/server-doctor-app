const server = require('express').Router();
const { updateUser, findUserById } = require('../../controllers/users');

server.put('/:id', async (req, res) => {
        const { id } = req.params;
        const data = req.body;

        try {
            await updateUser(id, data);
            const user = await findUserById(id)
            
            return res.status(200).json({
                success: true,
                data: user
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