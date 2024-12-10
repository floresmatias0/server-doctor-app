const mongoose = require('mongoose');
const Rating = require('../models/rating');
const Booking = require('../models/booking');

const createRating = async (req, res) => {
    try {
      const { doctorId, patientId, bookingId, rating, comment } = req.body;
  
      console.log('Datos recibidos:', { doctorId, patientId, bookingId, rating, comment });
  
      // Verificar la existencia de una calificación existente
      let existingRating = await Rating.findOne({ doctorId, patientId, bookingId });
  
      if (existingRating) {
        // Actualizar la calificación existente
        existingRating.rating = rating;
        existingRating.comment = comment;
        await existingRating.save();
  
        console.log('Calificación actualizada:', existingRating);
        
        // Actualizar la reserva para marcarla como calificada
        const bookingToUpdate = await Booking.findOne({ customBookingIdField: bookingId });
        if (!bookingToUpdate) {
          console.error(`No se encontró la reserva con customBookingIdField: ${bookingId}`);
          return res.status(404).json({ success: false, error: 'Booking not found' });
        }
  
        bookingToUpdate.isRated = true;
        bookingToUpdate.rating = existingRating._id; // Cambiar de ratingId a rating
        await bookingToUpdate.save();
  
        console.log('Resultado de la actualización de la reserva:', bookingToUpdate);
  
        res.status(201).json({ success: true, rating: existingRating });
      } else {
        // Crear una nueva calificación
        const newRating = new Rating({
          doctorId: new mongoose.Types.ObjectId(doctorId),
          patientId: new mongoose.Types.ObjectId(patientId),
          bookingId,
          rating,
          comment
        });
  
        await newRating.save();
        console.log('Calificación guardada:', newRating);
  
        // Actualizar la reserva para marcarla como calificada
        const bookingToUpdate = await Booking.findOne({ customBookingIdField: bookingId });
        if (!bookingToUpdate) {
          console.error(`No se encontró la reserva con customBookingIdField: ${bookingId}`);
          return res.status(404).json({ success: false, error: 'Booking not found' });
        }
  
        bookingToUpdate.isRated = true;
        bookingToUpdate.rating = newRating._id; // Cambiar de ratingId a rating
        await bookingToUpdate.save();
  
        console.log('Resultado de la actualización de la reserva:', bookingToUpdate);
  
        res.status(201).json({ success: true, rating: newRating });
      }
    } catch (error) {
      console.error('Error al crear/actualizar la calificación:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

const getAverageRating = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const ratings = await Rating.find({ doctorId: new mongoose.Types.ObjectId(doctorId) });

    if (!ratings.length) {
      return res.status(200).json({ success: true, averageRating: 0, totalRatings: 0 });
    }

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = sumRatings / totalRatings;

    res.status(200).json({ success: true, averageRating, totalRatings });
  } catch (error) {
    console.error('Error al obtener la calificación promedio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createRating, getAverageRating };
