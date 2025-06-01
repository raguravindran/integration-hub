const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

// Get all metrics
router.get('/', metricsController.getMetrics);

// Get metrics for a specific integration
router.get('/integration/:integrationId', metricsController.getIntegrationMetrics);

// Get aggregated metrics for dashboard
router.get('/dashboard', metricsController.getDashboardMetrics);

// Get metrics summary for all integrations
router.get('/summary', metricsController.getMetricsSummary);

// Create a new metric
router.post('/', metricsController.createMetric);

module.exports = router;
