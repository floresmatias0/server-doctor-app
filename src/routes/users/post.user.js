const server = require('express').Router();
const { check, validationResult } = require('express-validator');
const { createUser, verifyUserByEmail } = require('../../controllers/users');

server.post('/',
    check('email').isEmail().custom(async value => {
        const user = await verifyUserByEmail(value);
        if (user) {
            throw new Error('E-mail already in use');
        }
    }),
    async (req, res) => {
        const data = req.body;
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                errors: errors.array()
            });
        }

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