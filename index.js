require('dotenv').config();

const chalk = require('chalk');
const server = require('./src/app.js');
const { connect } = require('./src/db.js');
const { PORT } = process.env;

connect();

server.listen(PORT, () => {
  console.log(chalk.yellow('Listening at ' + PORT)); // eslint-disable-line no-console
});