const mongoose = require('mongoose');
const chalk = require('chalk');

async function connect() {
  try {
    await mongoose.connect(process.env.DB_MONGOOSE, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log(chalk.yellow('Mongoose connect successfully'))
  }catch(err) {
    console.log(chalk.red(err.message))
    throw new Error(err.message)
  }
}

module.exports = { connect };