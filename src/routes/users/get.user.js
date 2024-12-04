const server = require('express').Router();
const { findAllUsers, findUserById } = require('../../controllers/users');

server.get('/',
    async (req, res) => {
        const { filters } = req.query

        if(filters) {
            let parseFilters = JSON.parse(filters);

            try {
                const users = await findAllUsers(parseFilters);

                return res.status(200).json({
                    success: true,
                    data: users
                });
            } catch (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }
        }

        try {
            const users = await findAllUsers();

            return res.status(200).json({
                success: true,
                data: users
            });
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
);

server.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await findUserById(id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;