require('dotenv').config();

const mysql = require('mysql2');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { DB_USER: user, DB_PASSWORD: password , DB_HOST: host, DB_NAME: database, DB_PORT: port } = process.env;

//conectamos a la db
const connection = mysql.createConnection({ host, port, user, password, database });
connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

const sequelize = new Sequelize(database, user, password, {
  logging: console.log, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => {
        console.log(chalk.blue(`base de datos: ${database} conectada correctamente.`));
    })
    .catch(err => {
        console.log(chalk.red('Hubo un error al intentar conectar con la base de datos:', err));
    })

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { User } = sequelize.models;

// Aca vendrian las relaciones:

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};