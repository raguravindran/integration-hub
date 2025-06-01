const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Integration = sequelize.define('Integration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('API', 'Database', 'File', 'Message Queue', 'Custom'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Error'),
    defaultValue: 'Active'
  },
  config: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.STRING,
    defaultValue: 'system'
  },
  lastModified: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  // Sequelize automatically adds createdAt and updatedAt fields
  tableName: 'integrations',
  timestamps: true
});

module.exports = Integration;
