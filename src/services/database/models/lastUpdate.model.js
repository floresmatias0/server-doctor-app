import Sequelize from "sequelize";
import { sequelize } from "../database/configuration/sequelize.config";

const lastUpdateAttributes = {
  id: { type: Sequelize.INTEGER(), primaryKey: true, unique: true },
  lastUpdate: { type: Sequelize.STRING(50), allowNull: true },
}

const lastUpdateOptions = {
  sequelize,
  table: 'lastUpdate',
  timestamps: false,
}

class lastUpdate extends Sequilize.Model { }

lastUpdate.init(lastUpdateAttributes, lastUpdateOptions)

module.export = lastUpdate