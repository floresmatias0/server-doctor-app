import Sequelize from "sequelize";
import { sequelize } from "../database/configuration/sequelize.config";

const userAttributes = {
  id: { type: Sequelize.STRING(255), primaryKey: true, unique: true },
  firstName: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  lastName: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  genre: { type: Sequelize.STRING(45), unique: false, allowNull: true },
  email: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  role: { type: Sequelize.STRING(45), unique: false, allowNull: true },
  reservePrice: { type: Sequelize.DECIMAL(18,2), unique: false, allowNull: true },
  reserveTime: { type: Sequelize.INTEGER(), unique: false, allowNull: true },
  reserveTimeFrom: { type: Sequelize.INTEGER(), unique: false, allowNull: true },
  reserveTimeUntil: { type: Sequelize.INTEGER(), unique: false, allowNull: true },
  reserveTimeFrom2: { type: Sequelize.INTEGER(), unique: false, allowNull: true },
  reserveTimeUntil2: { type: Sequelize.INTEGER(), unique: false, allowNull: true },
  reserveSaturday: { type: Sequelize.TINYINT(), unique: false, allowNull: true },
  reserveSunday: { type: Sequelize.TINYINT(), unique: false, allowNull: true },
  especialization: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  datOfBirth: { type: Sequelize.STRING(50), unique: false, allowNull: true },
  phone: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  identityType: { type: Sequelize.STRING(45), unique: false, allowNull: true },
  identityId: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  socialWork: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  socialWorkId: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  enrollment: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  validated: { type: Sequelize.STRING(45), unique: false, allowNull: true },
  createAt: { type: Sequelize.STRING(50), allowNull: true },
  updateAt: { type: Sequelize.STRING(50), allowNull: true },
}

const userOptions = {
  sequelize,
  table: 'user',
  timestamps: false,
}

class user extends Sequilize.Model { }

user.init(userAttributes, userOptions)

module.export = user