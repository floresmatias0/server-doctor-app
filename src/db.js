const mongoose = require('mongoose');
const chalk = require('chalk');

async function connect() {
  try {
    await mongoose.connect(process.env.DB_MONGOOSE, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      serverSelectionTimeoutMS: 3000, // Tiempo límite para seleccionar un servidor (5 segundos)
      socketTimeoutMS: 45000, // Tiempo máximo de inactividad de la conexión (45 segundos)
      connectTimeoutMS: 10000, // Tiempo máximo de espera para establecer una conexión inicial (10 segundos)
      retryWrites: true, // Habilitar reintentos automáticos en escrituras fallidas
      maxPoolSize: 10, // Limitar el número máximo de conexiones simultáneas en el pool
    });
    console.log(chalk.yellow('Mongoose connect successfully'))
  }catch(err) {
    console.log(chalk.red(err.message))
    throw new Error(err.message)
  }
}

mongoose.connection.on('disconnected', () => {
  console.log(chalk.red('MongoDB disconnected! Trying to reconnect...'));
});

mongoose.connection.on('reconnected', () => {
  console.log(chalk.green('MongoDB reconnected successfully'));
});

module.exports = { connect };