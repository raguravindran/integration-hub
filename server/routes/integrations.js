const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');

// Get all integrations
router.get('/', integrationController.getIntegrations);

// Get single integration
router.get('/:id', integrationController.getIntegration);

// Get integration health data
router.get('/:id/health', integrationController.getIntegrationHealth);

// Create integration
router.post('/', integrationController.createIntegration);

// Update integration
router.put('/:id', integrationController.updateIntegration);

// Delete integration
router.delete('/:id', integrationController.deleteIntegration);

module.exports = router;
