const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    position: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'companies_employee',
    timestamps: false
});

module.exports = Employee;