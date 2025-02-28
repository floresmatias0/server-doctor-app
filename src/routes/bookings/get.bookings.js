const express = require('express');
const router = express.Router();
const { findBookingByBookingId } = require('../../controllers/calendars');

// Ruta para obtener los detalles de una reserva específica por ID
router.get('/:bookingId', async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    const booking = await findBookingByBookingId(bookingId); // Usar la nueva función para buscar por booking_id
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
