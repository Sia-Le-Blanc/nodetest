const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('NodeTest', 'root', '1234', {
    host : '127.0.0.1',
    dialect : 'mysql',
    port : 3306
});

module.exports = sequelize;