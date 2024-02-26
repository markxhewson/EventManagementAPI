const connection = require('../connection');
const { DataTypes } = require('sequelize');

const Event = connection.define('Event', {
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
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Event;