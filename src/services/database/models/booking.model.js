import Sequelize from "sequelize";
import { sequelize } from "../database/configuration/sequelize.config";

const bookingAttributes = {
  id: {type: Sequelize.STRING(255), primaryKey: true, unique: true},
  order: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  booking: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  user: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  status: {type: Sequelize.STRING(45), unique: false, allowNull: true},
  organizer_id: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  organizer_name: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  organizer_email: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  organizer_role: {type: Sequelize.STRING(45), unique: false, allowNull: true},
  organizer_price: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
  organizer_time: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  start_dateTime: { type: Sequelize.STRING(50), allowNull: true },
  start_timeZone: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  end_dateTime: { type: Sequelize.STRING(50), allowNull: true },
  end_timeZone: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  symptoms: {type: Sequelize.STRING(300), unique: false, allowNull: true},
  patiente: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  certificate: {type: Sequelize.STRING(255), unique: false, allowNull: true},
  details: {type: Sequelize.STRING(300), unique: false, allowNull: true},
  createAt: { type: Sequelize.STRING(50), allowNull: true },
  updateAt: { type: Sequelize.STRING(50), allowNull: true },
}

const bookingOptions = {
  sequelize,
  table: 'booking',
  timestamps: false,
}

class booking extends Sequilize.Model {}

booking.init(bookingAttributes, bookingOptions)

module.export = booking