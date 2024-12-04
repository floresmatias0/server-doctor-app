import Sequelize from "sequelize";
import { sequelize } from "../database/configuration/sequelize.config";

const patientAttributes = {
  id: { type: Sequelize.STRING(255), primaryKey: true, unique: true },
  merchant_order_id: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  status: { type: Sequelize.STRING(45), unique: false, allowNull: true },
  payer: { type: Sequelize.STRING(255), allowNull: true },
  doctor: { type: Sequelize.STRING(255), unique: false, allowNull: true },
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