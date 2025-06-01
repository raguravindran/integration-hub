const { sequelize, connectDB } = require('../config/db');
const Integration = require('../models/Integration');
const Metric = require('../models/Metric');

/**
 * Generate mock data for testing the IntegrationHub Dashboard
 * Run this script with: node utils/generateMockData.js
 */

// Database connection is handled by the imported connectDB function

// Sample integration types
const integrationTypes = ['API', 'Database', 'File', 'Message Queue', 'Custom'];

// Sample sources and destinations
const sources = ['Salesforce', 'SAP', 'Website', 'HubSpot', 'Shopify', 'AWS', 'Azure', 'Google Cloud'];
const destinations = ['Data Warehouse', 'Marketo', 'Stripe', 'Snowflake', 'BigQuery', 'SQL Server', 'MongoDB', 'ElasticSearch'];

// Sample statuses
const statuses = ['Success', 'Failure', 'Warning', 'Processing'];

// Generate a random number between min and max (inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get a random item from an array
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate a random date between two dates
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Create mock integrations
const createIntegrations = async (count) => {
  try {
    // Clear existing integrations
    await Integration.destroy({ where: {}, truncate: true });
    
    const integrations = [];
    
    for (let i = 0; i < count; i++) {
      const source = getRandomItem(sources);
      const destination = getRandomItem(destinations);
      const type = getRandomItem(integrationTypes);
      
      // Using Sequelize create method instead of Mongoose's new Model and save
      const integrationData = {
        name: `${source} to ${destination} Integration`,
        description: `Integration between ${source} and ${destination} for data synchronization`,
        type,
        status: Math.random() > 0.2 ? 'Active' : (Math.random() > 0.5 ? 'Inactive' : 'Error'),
        source,
        destination,
        config: type === 'API' ? {
          url: `https://api.example.com/${source.toLowerCase()}`,
          authType: 'oauth2'
        } : type === 'Database' ? {
          connectionString: `jdbc:mariadb://localhost:3306/${source.toLowerCase()}`,
          dbType: 'mariadb'
        } : {},
        createdBy: 'system',
        createdAt: getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date())
      };
      
      const savedIntegration = await Integration.create(integrationData);
      integrations.push(savedIntegration);
    }
    
    console.log(`Created ${integrations.length} mock integrations`);
    return integrations;
  } catch (err) {
    console.error('Error creating mock integrations:', err);
    throw err;
  }
};

// Create mock metrics for integrations
const createMetrics = async (integrations, metricsPerIntegration) => {
  try {
    // Clear existing metrics
    await Metric.destroy({ where: {}, truncate: true });
    
    let totalMetrics = 0;
    
    for (const integration of integrations) {
      // Generate metrics over the last 30 days
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      for (let i = 0; i < metricsPerIntegration; i++) {
        const timestamp = getRandomDate(startDate, endDate);
        const status = getRandomItem(statuses);
        const responseTime = getRandomInt(50, 2000); // 50ms to 2s
        const dataVolume = getRandomInt(1000, 1000000); // 1KB to 1MB
        
        // Using Sequelize create instead of Mongoose's new Model and save
        const metricData = {
          integrationId: integration.id,  // In Sequelize, it's 'id' not '_id'
          timestamp,
          status,
          responseTime,
          dataVolume,
          errorMessage: status === 'Failure' ? 'Connection timeout' : '',
          successCount: status === 'Success' ? getRandomInt(1, 100) : 0,
          failureCount: status === 'Failure' ? getRandomInt(1, 10) : 0,
          metadata: {
            endpoint: integration.type === 'API' ? '/api/data' : null,
            records: getRandomInt(1, 1000)
          }
        };
        
        await Metric.create(metricData);
        totalMetrics++;
      }
    }
    
    console.log(`Created ${totalMetrics} mock metrics for ${integrations.length} integrations`);
  } catch (err) {
    console.error('Error creating mock metrics:', err);
    throw err;
  }
};

// Main function to generate all mock data
const generateMockData = async () => {
  try {
    await connectDB();
    
    // Make sure database tables are synced
    await sequelize.sync();
    console.log('MariaDB tables synced successfully');
    
    const integrations = await createIntegrations(10); // Create 10 integrations
    await createMetrics(integrations, 100); // Create 100 metrics per integration
    
    console.log('Mock data generation completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Mock data generation failed:', err);
    process.exit(1);
  }
};

// Execute the script
generateMockData();
