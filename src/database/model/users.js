const connection = require('../connection');
const { DataTypes } = require('sequelize');

const User = connection.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  smsNotifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  twoFactorAuth: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  preferredAuth: {
    type: DataTypes.STRING,
    allowNull: false
  },
  authenticated: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = User;