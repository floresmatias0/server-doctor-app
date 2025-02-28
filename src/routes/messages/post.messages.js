const server = require('express').Router();
const { reservedShift, notifyPatientToConfirmBooking, doctorEvaluationEmail } = require('../../controllers/messages');

server.post('/', async (req, res) => {
  try {
    const {
      emailType,
      sendTo,
      subject,
      patientName,
      doctorName,
      doctorEspecialization,
      startDate,
      price,
      bookingId,
      doctorEmail,
      isHtml,
    } = req.body;

    let data;
    switch (emailType) {
      case 'reservedShift':
        data = await reservedShift(sendTo, isHtml, subject, patientName, doctorName, doctorEspecialization, startDate, price, bookingId, doctorEmail);
        break;
      case 'notifyPatientToConfirmBooking':
        data = await notifyPatientToConfirmBooking(sendTo, subject, patientName, doctorName, doctorEspecialization, startDate, price, bookingId, doctorEmail);
        break;
      case 'doctorEvaluationEmail':
        data = await doctorEvaluationEmail(sendTo, doctorName, subject);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid email type"
        });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = server;
