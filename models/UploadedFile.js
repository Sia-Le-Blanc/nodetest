const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UploadedFile = sequelize.define('UploadedFile', {
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        charset: 'utf8mb4',  // 추가
        collate: 'utf8mb4_unicode_ci'  // 추가
    },
    file_type: {
        type: DataTypes.ENUM('excel', 'image'),
        allowNull: false
    },
    original_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        charset: 'utf8mb4',  // 추가
        collate: 'utf8mb4_unicode_ci'  // 추가
    },
    processed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'uploaded_files',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',  // 추가
    collate: 'utf8mb4_unicode_ci'  // 추가
});

module.exports = UploadedFile;