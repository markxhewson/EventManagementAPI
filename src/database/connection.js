const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({ dialect: "sqlite", storage: "src/database/storage.sqlite", logging: true });

module.exports = sequelize;