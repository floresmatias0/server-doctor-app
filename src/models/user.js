const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {

    sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('admin', 'basic'),
            allowNull: false,
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
};