const connection = require('../connection');
const { DataTypes } = require('sequelize');

const Code = connection.define('Code', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    authenticated: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
});

module.exports = Code;