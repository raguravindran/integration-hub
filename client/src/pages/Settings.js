import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    refreshInterval: 30,
    apiKey: '',
    language: 'en'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would save to backend or localStorage
    alert('Settings saved!');
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h3>General Settings</h3>
          
          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select 
              id="language" 
              name="language" 
              value={settings.language} 
              onChange={handleChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          
          <div className="form-group checkbox">
            <input 
              type="checkbox" 
              id="darkMode" 
              name="darkMode" 
              checked={settings.darkMode} 
              onChange={handleChange}
            />
            <label htmlFor="darkMode">Dark Mode</label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Dashboard Settings</h3>
          
          <div className="form-group">
            <label htmlFor="refreshInterval">Data Refresh Interval (seconds)</label>
            <input 
              type="number" 
              id="refreshInterval" 
              name="refreshInterval" 
              min="5" 
              max="300" 
              value={settings.refreshInterval} 
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group checkbox">
            <input 
              type="checkbox" 
              id="notifications" 
              name="notifications" 
              checked={settings.notifications} 
              onChange={handleChange}
            />
            <label htmlFor="notifications">Enable Notifications</label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>API Settings</h3>
          
          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input 
              type="password" 
              id="apiKey" 
              name="apiKey" 
              value={settings.apiKey} 
              onChange={handleChange} 
              placeholder="Enter your API key"
            />
          </div>
          
          <p className="help-text">
            The API key is used for external integrations. Leave blank if not needed.
          </p>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-submit">
            Save Settings
          </button>
          <button type="button" className="btn-cancel">
            Reset to Defaults
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
