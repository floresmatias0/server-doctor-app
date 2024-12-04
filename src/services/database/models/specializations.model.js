import Sequelize from "sequelize";
import { sequelize } from "../database/configuration/sequelize.config";

const specializationAttributes = {
  id: { type: Sequelize.STRING(255), primaryKey: true, unique: true },
  name: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  createAt: { type: Sequelize.STRING(50), allowNull: true },
  updateAt: { type: Sequelize.STRING(50), allowNull: true },
}

const specializationOptions = {
  sequelize,
  table: 'specialization',
  timestamps: false,
}

class specialization extends Sequilize.Model { }

specialization.init(specializationAttributes, specializationOptions)

module.export = specialization