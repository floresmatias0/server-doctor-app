import Sequelize from "sequelize";
import { sequelize } from "../database/configuration/sequelize.config";

const patientAttributes = {
  id: { type: Sequelize.STRING(255), primaryKey: true, unique: true },
  name: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  lastName: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  dateOfBirth: { type: Sequelize.STRING(50), allowNull: true },
  genre: { type: Sequelize.STRING(45), unique: false, allowNull: true },
  phone: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  email: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  history: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  identityType: { type: Sequelize.STRING(45), unique: false, allowNull: true },
  identityId: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  socialWork: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  socialWorkId: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  proceding: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  documents: { type: Sequelize.INTEGER(), unique: false, allowNull: true },
  createAt: { type: Sequelize.STRING(50), allowNull: true },
  updateAt: { type: Sequelize.STRING(50), allowNull: true },
}

const patientOptions = {
  sequelize,
  table: 'patient',
  timestamps: false,
}

class patient extends Sequilize.Model { }

patient.init(patientAttributes, patientOptions)

module.export = patient