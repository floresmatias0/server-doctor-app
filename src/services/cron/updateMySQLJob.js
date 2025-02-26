const Booking = require('../../models/booking')
const Certificate = require('../../models/certificate')
const Patient = require('../../models/patient')
const Payment = require('../../models/payment')
const Specializations = require('../../models/specializations')
const Symptoms = require('../../models/symptoms')
const User = require('../../models/user')

const { sequelize } = require('../database/configuration/sequelize.config')
const booking = require('../database/models/booking.model')
const certificate = require('../database/models/certificate.model')
const patient = require('../database/models/patient.model')
const payment = require('../database/models/payment.model')
const specializations = require('../database/models/specializations.model')
const symptoms = require('../database/models/symptoms.model')
const user = require('../database/models/user.model')
const lastUpdate = require('../database/models/last_update.model')

const normalizaedSymtoms = async (data) => {
  try {
    let response = ''
    for (let ele of data) {
      response += `${await symptoms.find({ _id: ele })},`
    }
    return response
  } catch (err) {
    return null
  }
}

const normalizedCertificate = (data) => {
  return data.length()
}

const updateBooking = async (date) => {
  try {
    //get mongo data
    const mongoData = await Booking.find({ updatedAt: { $gte: date } })
    //upsert in mySQL
    if (mongoData.length > 0) {
      for (let ele of mongoData) {
        await booking.upsert({
          id: ele._id,
          order: ele.order_id ? ele.order_id : null,
          booking: ele.booking_id ? ele.booking_id : null,
          user: ele.user_id ? ele.user_id : null,
          status: ele.status ? ele.status : null,
          organizer_id: ele.organizer._id ? ele.organizer._id : null,
          organizer_name: ele.organizer.name ? ele.organizer.name : null,
          organizer_email: ele.organizer.email ? ele.organizer.email : null,
          organizer_role: ele.organizer.role ? ele.organizer.role : null,
          organizer_price: ele.organizer.price ? ele.organizer.price : null,
          organizer_time: ele.organizer.time ? ele.organizer.time : null,
          start_dateTime: ele.start.dateTime ? ele.start.dateTime : null,
          start_timeZone: ele.start.timeZone ? ele.start.timeZone : null,
          end_dateTime: ele.end.dateTime ? ele.end.dateTime : null,
          end_timeZone: ele.end.timeZone ? ele.end.timeZone : null,
          symptoms: await normalizaedSymtoms(ele.symptoms),
          patient: ele.patient ? ele.patient : null,
          certificate: normalizedCertificate(ele.certificate),
          details: ele.details ? ele.details : null,
          createAt: ele.createdAt ? ele.createdAt : null,
          updateAt: ele.updatedAt ? ele.updatedAt : null,
        })
      }
    }
    return true
  } catch (err) {
    return null
  }
}

const updateCertificate = async (date) => {
  try {
    //get mongo data
    const mongoData = await Certificate.find({ updatedAt: { $gte: date } })
    //upsert in mySQL
    if (mongoData.length > 0) {
      for (let ele of mongoData) {
        await certificate.upsert({
          id: ele._id,
          fileName: ele.filename ? ele.filename : null,
          type: ele.type ? ele.type : null,
          name: ele.name ? ele.name : null,
          patient: ele.patient ? ele.patient : null,
          doctor: ele.doctor ? ele.doctor : null,
          createAt: ele.createdAt ? ele.createdAt : null,
          updateAt: ele.updatedAt ? ele.updatedAt : null,
        })
      }
    }
    return true
  } catch (err) {
    return null
  }
}

const updatePatient = async (date) => {
  try {
    //get mongo data
    const mongoData = await Patient.find({ updatedAt: { $gte: date } })
    //upsert in mySQL
    if (mongoData.length > 0) {
      for (let ele of mongoData) {
        await patient.upsert({
          id: ele._id,
          name: ele.name ? ele.name : ele.firstName,
          lastName: ele.lastName ? ele.lastName : null,
          dateOfBirth: ele.dateOfBirth ? ele.dateOfBirth : null,
          genre: ele.genre ? ele.genre : null,
          phone: ele.phone ? ele.phone : null,
          email: ele.email ? ele.email : null,
          history: ele.history ? ele.history : null,
          identityType: ele.identityType ? ele.identityType : null,
          identityId: ele.identityId ? ele.identityId : null,
          socialWork: ele.socialWork ? ele.socialWork : null,
          socialWorkId: ele.socialWorkId ? ele.socialWorkId : null,
          proceding: ele.proceedings ? ele.proceedings : null,
          documents: ele.documents ? ele.documents.length() : null,
          createAt: ele.createdAt ? ele.createdAt : null,
          updateAt: ele.updatedAt ? ele.updatedAt : null,
        })
      }
    }
    return true
  } catch (err) {
    return null
  }
}

const updatePayment = async (date) => {
  try {
    //get mongo data
    const mongoData = await Payment.find({ updatedAt: { $gte: date } })
    //upsert in mySQL
    if (mongoData.length > 0) {
      for (let ele of mongoData) {
        await payment.upsert({
          id: ele.payment_id,
          merchant_order_id: ele.merchant_order_id ? ele.merchant_order_id : null,
          status: ele.status ? ele.status : null,
          payer: ele.payer ? ele.payer : null,
          doctor: ele.doctor ? ele.doctor : null,
          createAt: ele.createdAt ? ele.createdAt : null,
          updateAt: ele.updatedAt ? ele.updatedAt : null,
        })
      }
    }
    return true
  } catch (err) {
    return null
  }
}

const updateSpecializations = async (date) => {
  try {
    //get mongo data
    const mongoData = await Specializations.find({ updatedAt: { $gte: date } })
    //upsert in mySQL
    if (mongoData.length > 0) {
      for (let ele of mongoData) {
        await specializations.upsert({
          id: ele._id,
          name: ele.name ? ele.name : null,
          createAt: ele.createdAt ? ele.createdAt : null,
          updateAt: ele.updatedAt ? ele.updatedAt : null,
        })
      }
    }
    return true
  } catch (err) {
    return null
  }
}

const updateSymptoms = async (date) => {
  try {
    //get mongo data
    const mongoData = await Symptoms.find({ updatedAt: { $gte: date } })
    //upsert in mySQL
    if (mongoData.length > 0) {
      for (let ele of mongoData) {
        await symptoms.upsert({
          id: ele._id,
          name: ele.name ? ele.name : null,
          createAt: ele.createdAt ? ele.createdAt : null,
          updateAt: ele.updatedAt ? ele.updatedAt : null,
        })
      }
    }
    return true
  } catch (err) {
    return null
  }
}

const updateUser = async (date) => {
  try {
    //get mongo data
    const mongoData = await User.find({ updatedAt: { $gte: date } })
    //upsert in mySQL
    if (mongoData.length > 0) {
      for (let ele of mongoData) {
        await user.upsert({
          id: ele._id,
          firstName: ele.firstName ? ele.firstName : null,
          lastName: ele.lastName ? ele.lastName : null,
          genre: ele.genre ? ele.genre : null,
          email: ele.email ? ele.email : null,
          role: ele.role ? ele.role : null,
          reservePrice: ele.reservePrice ? ele.reservePrice : null,
          reserveTime: ele.reserveTime ? ele.reserveTime : null,
          reserveTimeFrom: ele.reserveTimeFrom ? ele.reserveTimeFrom : null,
          reserveTimeUntil: ele.reserveTimeUntil ? ele.reserveTimeUntil : null,
          reserveTimeFrom2: ele.reserveTimeFrom2 ? ele.reserveTimeFrom2 : null,
          reserveTimeUntil2: ele.reserveTimeUntil2 ? ele.reserveTimeUntil2 : null,
          reserveSaturday: ele.reserveSaturday ? ele.reserveSaturday : null,
          reserveSunday: ele.reserveSunday ? ele.reserveSunday : null,
          especialization: ele.especialization ? ele.especialization : null,
          datOfBirth: ele.dateOfBirth ? ele.dateOfBirth : null,
          phone: ele.phone ? ele.phone : null,
          identityType: ele.identityType ? ele.identityType : null,
          identityId: ele.identityId ? ele.identityId : null,
          socialWork: ele.socialWork ? ele.socialWork : null,
          socialWorkId: ele.socialWorkId ? ele.socialWorkId : null,
          enrollment: ele.enrollment ? ele.enrollment : null,
          validated: ele.validated ? ele.validated : null,
          createAt: ele.createdAt ? ele.createdAt : null,
          updateAt: ele.updatedAt ? ele.updatedAt : null,
        })
      }
    }
    return true
  } catch (err) {
    return null
  }
}

const updateLastUpdate = async (date) => {
  try {
    await lastUpdate.upser({
      id: 1,
      lastUpdate: date,
    })
    return true
  }catch(err) {
    return err
  }
}

const updateMySQL = async () => {
  try {
    //TODO crear el registro de tiewmpo de update para tomar referencia de q info traer para el update
    await sequelize.authenticate()
    const lastUpdate = await lastUpdate.find()
    if(!lastUpdate) throw new Error('LastUpdate get error')
    const newDate = new Date()
    const bookingResult = await updateBooking(lastUpdate.lastUpdate)
    const certificateResult = await updateCertificate(lastUpdate.lastUpdate)
    const patientResult = await updatePatient(lastUpdate.lastUpdate)
    const paymentResult = await updatePayment(lastUpdate.lastUpdate)
    const specializationsResult = await updateSpecializations(lastUpdate.lastUpdate)
    const symptomsResult = await updateSymptoms(lastUpdate.lastUpdate)
    const userResult = await updateUser(lastUpdate.lastUpdate)
    const lastUpdateResult = await updateLastUpdate(newDate)
  } catch (err) {
    return err
  }
}




module.exports = updateMySQL