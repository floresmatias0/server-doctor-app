const server = require('express').Router();
const { updateBooking } = require('../../controllers/calendars');

server.patch('/update-booking/:id', async (req, res) => {
    try {
        const id = req.params
        const { details } = req.body;

        const response = await updateBooking(id, { details })

        if(!response) {
            return res.status(500).json({
                success: false,
                error: "Something wrong to update booking"
            });
        }

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
