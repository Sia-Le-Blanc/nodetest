const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Approval = sequelize.define('Approval', {
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'companies_approval',
    timestamps: false
});

module.exports = Approval;