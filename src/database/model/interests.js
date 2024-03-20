const connection = require('../connection');
const { DataTypes } = require('sequelize');

const Interests = connection.define('Interests', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
});

module.exports = Interests;