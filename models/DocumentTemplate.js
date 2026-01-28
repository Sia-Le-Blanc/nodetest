const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentTemplate = sequelize.define('DocumentTemplate', {
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    template_file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
    }
}, {
    tableName: 'document_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = DocumentTemplate;