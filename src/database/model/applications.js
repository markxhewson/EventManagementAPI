const connection = require('../connection');
const { DataTypes } = require('sequelize');

const Application = connection.define('Application', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true
    },
    why: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ideas: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = Application;