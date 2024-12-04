const server = require('express').Router();

server.get('/create-order', async (req, res) => {
    try {
        const { id } = req.params;

        const events = await findAllBooking({ 'user_id': id })

        return res.status(200).json({
            success: true,
            data: events
        });
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

server.get('/success', async (req, res) => {
    try {
        const { id } = req.params;

        const events = await findAllBooking({ 'user_id': id })

        return res.status(200).json({
            success: true,
            data: events
        });
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

server.get('/webhook', async (req, res) => {
    try {
        const { id } = req.params;

        const events = await findAllBooking({ 'user_id': id })

        return res.status(200).json({
            success: true,
            data: events
        });
    }catch(err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
})

module.exports = server;