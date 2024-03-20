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
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  start_date: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  end_date: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  max_registrations: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    /* ('paused', 'cancelled', 'active') */
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  }
});

module.exports = Event;