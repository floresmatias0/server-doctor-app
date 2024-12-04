import Sequelize from "sequelize";
import { sequelize } from "../database/configuration/sequelize.config";

const certificateAttributes = {
  id: { type: Sequelize.STRING(255), primaryKey: true, unique: true },
  fileName: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  type: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  name: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  patient: { type: Sequelize.STRING(45), unique: false, allowNull: true },
  doctor: { type: Sequelize.STRING(255), unique: false, allowNull: true },
  createAt: { type: Sequelize.STRING(50), allowNull: true },
  updateAt: { type: Sequelize.STRING(50), allowNull: true },
}

const certificateOptions = {
  sequelize,
  table: 'certificate',
  timestamps: false,
}

class certificate extends Sequilize.Model { }

certificate.init(certificateAttributes, certificateOptions)

module.export = certificate