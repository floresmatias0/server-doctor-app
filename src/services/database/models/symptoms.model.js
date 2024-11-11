import Sequelize from "sequelize";
import { sequelize } from "../database/configuration/sequelize.config";

const symptomsAttributes = {
  id: { type: Sequelize.STRING(255), primaryKey: true, unique: true },
  name: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  createAt: { type: Sequelize.STRING(50), allowNull: true },
  updateAt: { type: Sequelize.STRING(50), allowNull: true },
}

const symptomsOptions = {
  sequelize,
  table: 'symptoms',
  timestamps: false,
}

class symptoms extends Sequilize.Model { }

symptoms.init(symptomsAttributes, symptomsOptions)

module.export = symptoms