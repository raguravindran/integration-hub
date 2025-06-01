import React, { useState, useEffect } from 'react';
import IntegrationForm from '../components/IntegrationForm';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from your backend API
    // For now, we'll use mock data
    const mockIntegrations = [
      {
        _id: '1',
        name: 'CRM Integration',
        description: 'Sync customer data between CRM and marketing platform',
        type: 'API',
        status: 'Active',
        source: 'Salesforce',
        destination: 'Marketo',
        createdAt: new Date('2023-01-15').toISOString()
      },
      {
        _id: '2',
        name: 'ERP System',
        description: 'Inventory and order management integration',
        type: 'Database',
        status: 'Error',
        source: 'SAP',
        destination: 'Data Warehouse',
        createdAt: new Date('2023-02-10').toISOString()
      },
      {
        _id: '3',
        name: 'Payment Gateway',
        description: 'Process payments and update financial systems',
        type: 'API',
        status: 'Active',
        source: 'Website',
        destination: 'Stripe',
        createdAt: new Date('2023-03-05').toISOString()
      },
      {
        _id: '4',
        name: 'Data Warehouse',
        description: 'Central data repository for analytics',
        type: 'Database',
        status: 'Active',
        source: 'Multiple Systems',
        destination: 'Snowflake',
        createdAt: new Date('2023-03-22').toISOString()
      },
      {
        _id: '5',
        name: 'Marketing API',
        description: 'Integration with marketing automation system',
        type: 'API',
        status: 'Active',
        source: 'Website',
        destination: 'HubSpot',
        createdAt: new Date('2023-04-18').toISOString()
      }
    ];
    
    setTimeout(() => {
      setIntegrations(mockIntegrations);
      setLoading(false);
    }, 800); // Simulate loading
  }, []);

  const handleCreateIntegration = (formData) => {
    // In a real app, this would call your API to create a new integration
    const newIntegration = {
      _id: Date.now().toString(), // This would come from the server in a real app
      ...formData,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    
    setIntegrations([newIntegration, ...integrations]);
    setShowForm(false);
  };

  const handleUpdateIntegration = (formData) => {
    // In a real app, this would call your API to update the integration
    const updatedIntegrations = integrations.map(integration => 
      integration._id === currentIntegration._id ? 
        { ...integration, ...formData, lastModified: new Date().toISOString() } : 
        integration
    );
    
    setIntegrations(updatedIntegrations);
    setShowForm(false);
    setCurrentIntegration(null);
  };

  const handleDeleteIntegration = (id) => {
    // In a real app, this would call your API to delete the integration
    if (window.confirm('Are you sure you want to delete this integration?')) {
      const filteredIntegrations = integrations.filter(integration => integration._id !== id);
      setIntegrations(filteredIntegrations);
    }
  };

  const handleEditIntegration = (integration) => {
    setCurrentIntegration(integration);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentIntegration(null);
  };

  const handleFormSubmit = (formData) => {
    if (currentIntegration) {
      handleUpdateIntegration(formData);
    } else {
      handleCreateIntegration(formData);
    }
  };

  if (loading) {
    return <div className="loading">Loading integrations...</div>;
  }

  return (
    <div className="integrations-page">
      <div className="page-header">
        <h2>Integrations</h2>
        <button 
          className="btn-create" 
          onClick={() => setShowForm(true)}
        >
          + New Integration
        </button>
      </div>
      
      {showForm ? (
        <div className="form-container">
          <h3>{currentIntegration ? 'Edit Integration' : 'Create New Integration'}</h3>
          <IntegrationForm 
            integration={currentIntegration}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <div className="integrations-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map(integration => (
                <tr key={integration._id}>
                  <td>{integration.name}</td>
                  <td>{integration.type}</td>
                  <td>{integration.source}</td>
                  <td>{integration.destination}</td>
                  <td>
                    <span className={`status-badge ${integration.status.toLowerCase()}`}>
                      {integration.status}
                    </span>
                  </td>
                  <td>{new Date(integration.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditIntegration(integration)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteIntegration(integration._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {integrations.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-data">
                    No integrations found. Create your first integration!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Integrations;
