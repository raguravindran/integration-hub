import React, { useState, useEffect } from 'react';

const IntegrationForm = ({ integration, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'API',
    source: '',
    destination: '',
    config: {}
  });

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name || '',
        description: integration.description || '',
        type: integration.type || 'API',
        source: integration.source || '',
        destination: integration.destination || '',
        config: integration.config || {}
      });
    }
  }, [integration]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderConfigFields = () => {
    // Different form fields based on integration type
    switch (formData.type) {
      case 'API':
        return (
          <>
            <div className="form-group">
              <label>API URL</label>
              <input
                type="text"
                name="url"
                value={formData.config.url || ''}
                onChange={handleConfigChange}
                placeholder="https://api.example.com/v1"
                required
              />
            </div>
            <div className="form-group">
              <label>Authentication Type</label>
              <select
                name="authType"
                value={formData.config.authType || 'none'}
                onChange={handleConfigChange}
              >
                <option value="none">None</option>
                <option value="basic">Basic Auth</option>
                <option value="oauth2">OAuth 2.0</option>
                <option value="apiKey">API Key</option>
              </select>
            </div>
          </>
        );
      case 'Database':
        return (
          <>
            <div className="form-group">
              <label>Connection String</label>
              <input
                type="text"
                name="connectionString"
                value={formData.config.connectionString || ''}
                onChange={handleConfigChange}
                placeholder="mongodb://localhost:27017/db"
                required
              />
            </div>
            <div className="form-group">
              <label>Database Type</label>
              <select
                name="dbType"
                value={formData.config.dbType || 'mongodb'}
                onChange={handleConfigChange}
              >
                <option value="mongodb">MongoDB</option>
                <option value="mysql">MySQL</option>
                <option value="postgres">PostgreSQL</option>
                <option value="oracle">Oracle</option>
                <option value="sqlserver">SQL Server</option>
              </select>
            </div>
          </>
        );
      case 'File':
        return (
          <>
            <div className="form-group">
              <label>File Path</label>
              <input
                type="text"
                name="path"
                value={formData.config.path || ''}
                onChange={handleConfigChange}
                placeholder="/path/to/file"
                required
              />
            </div>
            <div className="form-group">
              <label>File Type</label>
              <select
                name="fileType"
                value={formData.config.fileType || 'csv'}
                onChange={handleConfigChange}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </>
        );
      case 'Message Queue':
        return (
          <>
            <div className="form-group">
              <label>Queue URL</label>
              <input
                type="text"
                name="queueUrl"
                value={formData.config.queueUrl || ''}
                onChange={handleConfigChange}
                placeholder="amqp://localhost"
                required
              />
            </div>
            <div className="form-group">
              <label>Queue Type</label>
              <select
                name="queueType"
                value={formData.config.queueType || 'rabbitmq'}
                onChange={handleConfigChange}
              >
                <option value="rabbitmq">RabbitMQ</option>
                <option value="kafka">Kafka</option>
                <option value="activemq">ActiveMQ</option>
                <option value="sqs">AWS SQS</option>
              </select>
            </div>
          </>
        );
      default:
        return (
          <div className="form-group">
            <label>Custom Configuration (JSON)</label>
            <textarea
              name="customConfig"
              value={formData.config.customConfig || ''}
              onChange={handleConfigChange}
              placeholder='{"key": "value"}'
              rows="4"
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="integration-form">
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Integration Name"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description of this integration"
          rows="2"
        />
      </div>
      
      <div className="form-group">
        <label>Type</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="API">API</option>
          <option value="Database">Database</option>
          <option value="File">File</option>
          <option value="Message Queue">Message Queue</option>
          <option value="Custom">Custom</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Source</label>
        <input
          type="text"
          name="source"
          value={formData.source}
          onChange={handleChange}
          placeholder="Source System"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Destination</label>
        <input
          type="text"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          placeholder="Destination System"
          required
        />
      </div>
      
      <h4>Configuration</h4>
      {renderConfigFields()}
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn-submit">
          {integration ? 'Update Integration' : 'Create Integration'}
        </button>
      </div>
    </form>
  );
};

export default IntegrationForm;
