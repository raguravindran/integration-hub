const Metric = require('../models/Metric');
const Integration = require('../models/Integration');
const { Op, Sequelize } = require('sequelize');
const { sequelize } = require('../config/db');

// Get all metrics
exports.getMetrics = async (req, res) => {
  try {
    const metrics = await Metric.findAll({
      order: [['timestamp', 'DESC']],
      limit: 100
    });
    res.json(metrics);
  } catch (err) {
    console.error('Error fetching metrics:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get metrics for a specific integration
exports.getIntegrationMetrics = async (req, res) => {
  try {
    const { integrationId } = req.params;
    const { timeframe } = req.query; // can be 'hour', 'day', 'week', 'month'
    
    let timeCondition = {};
    const now = new Date();
    
    if (timeframe === 'hour') {
      timeCondition = { timestamp: { [Op.gte]: new Date(now - 60 * 60 * 1000) } };
    } else if (timeframe === 'day') {
      timeCondition = { timestamp: { [Op.gte]: new Date(now - 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'week') {
      timeCondition = { timestamp: { [Op.gte]: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'month') {
      timeCondition = { timestamp: { [Op.gte]: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
    }
    
    const metrics = await Metric.findAll({
      where: {
        integrationId,
        ...timeCondition
      },
      order: [['timestamp', 'DESC']]
    });
    
    res.json(metrics);
  } catch (err) {
    console.error('Error fetching integration metrics:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get aggregated metrics for dashboard
exports.getDashboardMetrics = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get counts by status
    const statusCountsResult = await Metric.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        timestamp: { [Op.gte]: oneDayAgo }
      },
      group: ['status']
    });
    
    const statusCounts = statusCountsResult.map(result => ({
      _id: result.status,
      count: parseInt(result.getDataValue('count'))
    }));
    
    // Get average response times by integration
    const responseTimesResult = await Metric.findAll({
      attributes: [
        'integrationId',
        [Sequelize.fn('AVG', Sequelize.col('responseTime')), 'avgResponseTime'],
        [
          Sequelize.literal(`
            SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END) / COUNT(*)
          `),
          'successRate'
        ]
      ],
      where: {
        timestamp: { [Op.gte]: oneDayAgo }
      },
      group: ['integrationId'],
      include: [{
        model: Integration,
        attributes: ['name']
      }]
    });
    
    const responseTimesByIntegration = responseTimesResult.map(result => ({
      integrationName: result.Integration.name,
      avgResponseTime: parseFloat(result.getDataValue('avgResponseTime')),
      successRate: parseFloat(result.getDataValue('successRate'))
    }));
    
    // Get overall system health
    const totalMetrics = await Metric.count({
      where: {
        timestamp: { [Op.gte]: oneDayAgo }
      }
    });
    
    const successfulMetrics = await Metric.count({
      where: {
        status: 'Success',
        timestamp: { [Op.gte]: oneDayAgo }
      }
    });
    
    const overallSuccessRate = totalMetrics > 0 
      ? (successfulMetrics / totalMetrics * 100).toFixed(2) 
      : 100;
    
    // Get active integrations count
    const [totalCount, activeCount, errorCount, inactiveCount] = await Promise.all([
      Integration.count(),
      Integration.count({ where: { status: 'Active' } }),
      Integration.count({ where: { status: 'Error' } }),
      Integration.count({ where: { status: 'Inactive' } })
    ]);
    
    const integrationCounts = {
      total: totalCount,
      active: activeCount,
      error: errorCount,
      inactive: inactiveCount
    };
    
    // Get latest events
    const latestEvents = await Metric.findAll({
      order: [['timestamp', 'DESC']],
      limit: 10,
      include: [{
        model: Integration,
        attributes: ['name']
      }]
    });
    
    res.json({
      statusCounts,
      responseTimesByIntegration,
      overallSuccessRate,
      integrationCounts,
      latestEvents
    });
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new metric
exports.createMetric = async (req, res) => {
  try {
    const { integrationId } = req.body;
    
    // Verify the integration exists
    const integration = await Integration.findByPk(integrationId);
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }
    
    const metric = await Metric.create(req.body);
    
    // Update integration status if there's an error
    if (req.body.status === 'Failure') {
      await integration.update({ status: 'Error' });
    }
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('metricCreated', metric);
    io.to(integrationId.toString()).emit('metricCreated', metric);
    
    res.status(201).json(metric);
  } catch (err) {
    console.error('Error creating metric:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get metrics summary for all integrations
exports.getMetricsSummary = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'day';
    
    let timeCondition = {};
    const now = new Date();
    
    if (timeframe === 'hour') {
      timeCondition = { timestamp: { [Op.gte]: new Date(now - 60 * 60 * 1000) } };
    } else if (timeframe === 'day') {
      timeCondition = { timestamp: { [Op.gte]: new Date(now - 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'week') {
      timeCondition = { timestamp: { [Op.gte]: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'month') {
      timeCondition = { timestamp: { [Op.gte]: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
    }
    
    // Get metrics summary by integration
    const results = await Metric.findAll({
      attributes: [
        'integrationId',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalCount'],
        [
          Sequelize.literal(`SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END)`),
          'successCount'
        ],
        [
          Sequelize.literal(`SUM(CASE WHEN status = 'Failure' THEN 1 ELSE 0 END)`),
          'failureCount'
        ],
        [
          Sequelize.literal(`SUM(CASE WHEN status = 'Warning' THEN 1 ELSE 0 END)`),
          'warningCount'
        ],
        [Sequelize.fn('AVG', Sequelize.col('responseTime')), 'avgResponseTime'],
        [Sequelize.fn('MAX', Sequelize.col('responseTime')), 'maxResponseTime'],
        [Sequelize.fn('SUM', Sequelize.col('dataVolume')), 'totalDataVolume']
      ],
      where: timeCondition,
      group: ['integrationId'],
      include: [{
        model: Integration,
        attributes: ['name', 'status']
      }]
    });
    
    const metricsByIntegration = results.map(result => {
      const totalCount = parseInt(result.getDataValue('totalCount'));
      const successCount = parseInt(result.getDataValue('successCount'));
      
      return {
        integrationName: result.Integration.name,
        integrationStatus: result.Integration.status,
        integrationId: result.integrationId,
        totalCount,
        successCount,
        failureCount: parseInt(result.getDataValue('failureCount')),
        warningCount: parseInt(result.getDataValue('warningCount')),
        successRate: totalCount > 0 ? (successCount / totalCount * 100).toFixed(2) : 100,
        avgResponseTime: parseFloat(result.getDataValue('avgResponseTime')),
        maxResponseTime: parseInt(result.getDataValue('maxResponseTime')),
        totalDataVolume: parseInt(result.getDataValue('totalDataVolume'))
      };
    });
    
    // Sort by integration name
    metricsByIntegration.sort((a, b) => a.integrationName.localeCompare(b.integrationName));
    
    res.json(metricsByIntegration);
  } catch (err) {
    console.error('Error fetching metrics summary:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
