const server = require('express').Router();
const { check, validationResult } = require('express-validator');
const { findAllUsers, findUserById, findUserByEmail, verifyUserByEmail } = require('../../controllers/users');

server.get('/', async (req, res) => {
    try {
        const users = await findAllUsers();

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

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

server.get('/search',
    check('email').isEmail().custom(async value => {
        const user = await verifyUserByEmail(value);
        if (!user) {
            throw new Error('User not found');
        }
    }),
    async (req, res) => {
        const { email } = req.query;
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                errors: errors.array()
            });
        }

        try {
            const user = await findUserByEmail(email);
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
    }
);

module.exports = server;