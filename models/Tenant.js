const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tenant = sequelize.define('Tenant', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'companies_tenant',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Tenant;