const server = require('express').Router();
const { createUser } = require('../../controllers/users');

server.post('/',
    async (req, res) => {
        const data = req.body;

        try {
            await createUser(data);
            return res.status(200).json({
                success: true,
                data: 'User created successfully'
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