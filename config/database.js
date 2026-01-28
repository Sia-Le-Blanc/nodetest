const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('NodeTest', 'root', '1234', {
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306,
    dialectOptions: {
        charset: 'utf8mb4'
    },
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    }
});

module.exports = sequelize;