import { Sequelize } from "sequelize";

const mysqlDbHost = process.env.MYSQLDB_HOST
const mysqlDbPort = process.env.MYSQLDB_PORT
const mysqlDbName = process.env.MYSQLDB_NAME
const mysqlDbUser = process.env.MYSQLDB_USER
const mysqlDbPassword = process.env.MYSQLDB_PASSWORD

export const sequelize = new Sequelize(
	mysqlDbName,
	mysqlDbUser,
	mysqlDbPassword,
	{
		host: mysqlDbHost,
		port: parseInt(mysqlDbPort),
		dialect: "mysql",
		logging: (msg) => console.log(msg), // Asegúrate de ver la consulta completa
		logQueryParameters: true,
	}
);
