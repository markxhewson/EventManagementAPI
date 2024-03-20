const connection = require('../connection');
const { DataTypes } = require('sequelize');

const EventInterests = connection.define('EventInterests', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  interestId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = EventInterests;