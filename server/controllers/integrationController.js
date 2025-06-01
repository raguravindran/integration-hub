const Integration = require('../models/Integration');
const Metric = require('../models/Metric');
const { Op } = require('sequelize');

// Get all integrations
exports.getIntegrations = async (req, res) => {
  try {
    const integrations = await Integration.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(integrations);
  } catch (err) {
    console.error('Error fetching integrations:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get single integration
exports.getIntegration = async (req, res) => {
  try {
    const integration = await Integration.findByPk(req.params.id);
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }
    res.json(integration);
  } catch (err) {
    console.error('Error fetching integration:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create integration
exports.createIntegration = async (req, res) => {
  try {
    const integration = await Integration.create(req.body);
    
    // Emit a socket event for real-time updates
    const io = req.app.get('io');
    io.emit('integrationCreated', integration);
    
    res.status(201).json(integration);
  } catch (err) {
    console.error('Error creating integration:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update integration
exports.updateIntegration = async (req, res) => {
  try {
    const integration = await Integration.findByPk(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }
    
    // Update the integration
    const updatedData = {
      ...req.body,
      lastModified: new Date()
    };
    
    await integration.update(updatedData);
    
    // Refresh data
    const updatedIntegration = await Integration.findByPk(req.params.id);
    
    // Emit a socket event for real-time updates
    const io = req.app.get('io');
    io.emit('integrationUpdated', updatedIntegration);
    io.to(req.params.id.toString()).emit('integrationUpdated', updatedIntegration);
    
    res.json(updatedIntegration);
  } catch (err) {
    console.error('Error updating integration:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete integration
exports.deleteIntegration = async (req, res) => {
  try {
    const integration = await Integration.findByPk(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }
    
    // Delete the integration
    await integration.destroy();
    
    // Also delete associated metrics
    await Metric.destroy({
      where: { integrationId: req.params.id }
    });
    
    // Emit a socket event for real-time updates
    const io = req.app.get('io');
    io.emit('integrationDeleted', { id: req.params.id });
    
    res.json({ message: 'Integration removed' });
  } catch (err) {
    console.error('Error deleting integration:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get integration health
exports.getIntegrationHealth = async (req, res) => {
  try {
    const { id } = req.params;
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
    
    // Get metrics for this integration
    const metrics = await Metric.findAll({
      where: {
        integrationId: id,
        ...timeCondition
      },
      order: [['timestamp', 'DESC']]
    });
    
    // Calculate health stats
    const totalEvents = metrics.length;
    const successEvents = metrics.filter(metric => metric.status === 'Success').length;
    const failureEvents = metrics.filter(metric => metric.status === 'Failure').length;
    const warningEvents = metrics.filter(metric => metric.status === 'Warning').length;
    
    const successRate = totalEvents > 0 ? (successEvents / totalEvents * 100).toFixed(2) : 100;
    const avgResponseTime = totalEvents > 0 
      ? (metrics.reduce((sum, metric) => sum + metric.responseTime, 0) / totalEvents).toFixed(2)
      : 0;
    
    res.json({
      totalEvents,
      successEvents,
      failureEvents,
      warningEvents,
      successRate,
      avgResponseTime,
      metrics: metrics.slice(0, 10) // Return only the most recent 10 metrics
    });
    
  } catch (err) {
    console.error('Error getting integration health:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
