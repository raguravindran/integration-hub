const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Integration = require('./Integration');

const Metric = sequelize.define('Metric', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  integrationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Integration,
      key: 'id'
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('Success', 'Failure', 'Warning', 'Processing'),
    allowNull: false
  },
  responseTime: {
    type: DataTypes.INTEGER,  // in milliseconds
    defaultValue: 0
  },
  dataVolume: {
    type: DataTypes.INTEGER,  // in bytes
    defaultValue: 0
  },
  errorMessage: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  successCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failureCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'metrics',
  timestamps: true,
  indexes: [
    {
      fields: ['integrationId', 'timestamp']
    }
  ]
});

// Define association
Metric.belongsTo(Integration, { foreignKey: 'integrationId' });
Integration.hasMany(Metric, { foreignKey: 'integrationId' });

module.exports = Metric;
