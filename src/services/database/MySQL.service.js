const mysql = require('mysql');
const { mysqlDbHost, mysqlDbPassword, mysqlDbPowerBi, mysqlDbUser } = require('../../configs');

class MySQLService {
  // Una propiedad estática privada para almacenar la instancia singleton
  static instance;

  // Una propiedad privada para almacenar el pool de conexiones
  pool;

  // Un constructor privado para evitar la creación de nuevas instancias desde fuera de la clase
  constructor() {
    if (MySQLService.instance) {
      return MySQLService.instance;
    }
    MySQLService.instance = this;
  }

  // Un método estático público para obtener la instancia singleton o crear una si no existe
  static getInstance() {
    if (!MySQLService.instance) {
      MySQLService.instance = new MySQLService();
    }
    return MySQLService.instance;
  }

  // Un método público para conectar a la base de datos MySQL usando variables de entorno
  async connect() {
    try {
      // Crear un pool de conexiones usando las variables de entorno
      this.pool = mysql.createPool({
        host: mysqlDbHost,
        user: mysqlDbUser,
        password: mysqlDbPassword,
        database: mysqlDbPowerBi,
        port: Number(process.env.MYSQL_PORT),
        connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT),
      });

      // Probar la conexión obteniendo una conexión del pool
      const connection = await this.getConnection();
      console.log('Connected to MySQL database');

      // Liberar la conexión de vuelta al pool
      connection.release();
    } catch (error) {
      // Manejar el error lanzándolo
      console.error('Error connecting to MySQL database', error);
      throw error;
    }
  }

  // Un método público para desconectarse de la base de datos MySQL
  async disconnect() {
    try {
      // Finalizar todas las conexiones en el pool
      await this.pool.end();
      console.log('Disconnected from MySQL database');
    } catch (error) {
      // Manejar el error lanzándolo
      console.error('Error disconnecting from MySQL database', error);
      throw error;
    }
  }

  // Un método privado para obtener una conexión del pool
  getConnection() {
    return new Promise((resolve, reject) => {
      // Obtener una conexión del pool
      this.pool.getConnection((error, connection) => {
        if (error) {
          // Rechazar la promesa si hay un error
          return reject(error);
        }
        // Resolver la promesa con la conexión
        return resolve(connection);
      });
    });
  }

  // Un método público para ejecutar una consulta con parámetros opcionales y devolver los resultados
  query(sql, params) {
    return new Promise(async (resolve, reject) => {
      try {
        // Obtener una conexión del pool
        const connection = await this.getConnection();

        // Crear un objeto de opciones de consulta con sql y params
        const queryOptions = { sql, timeout: 40000 };
        if (params) queryOptions.values = params;

        // Ejecutar la consulta con las opciones de consulta
        connection.query(queryOptions, (error, results) => {
          if (error) {
            // Rechazar la promesa si hay un error
            return reject(error);
          }
          // Resolver la promesa con los resultados
          return resolve(results);
        });

        // Liberar la conexión de vuelta al pool
        connection.release();
      } catch (error) {
        // Rechazar la promesa si hay un error
        return reject(error);
      }
    });
  }
}

module.exports = MySQLService;
