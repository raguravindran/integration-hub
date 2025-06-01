import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { getIntegration, getIntegrationMetrics } from '../utils/api';
import MetricsChart from './MetricsChart';

const IntegrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinIntegration, leaveIntegration } = useSocket();
  
  const [integration, setIntegration] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [timeframe, setTimeframe] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch integration data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch integration details
        const integrationRes = await getIntegration(id);
        setIntegration(integrationRes.data);
        
        // Fetch metrics for this integration
        const metricsRes = await getIntegrationMetrics(id, timeframe);
        setMetrics(metricsRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching integration details:', err);
        setError('Failed to load integration details');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, timeframe]);

  // Join socket room for this integration
  useEffect(() => {
    if (socket && id) {
      joinIntegration(id);
      
      // Listen for real-time updates
      socket.on('integrationUpdated', (updatedIntegration) => {
        if (updatedIntegration._id === id) {
          setIntegration(updatedIntegration);
        }
      });
      
      socket.on('metricCreated', (newMetric) => {
        if (newMetric.integrationId === id) {
          setMetrics(prevMetrics => [newMetric, ...prevMetrics]);
        }
      });
      
      socket.on('integrationDeleted', (data) => {
        if (data.id === id) {
          navigate('/integrations', { replace: true });
        }
      });
      
      // Clean up listeners when component unmounts
      return () => {
        leaveIntegration(id);
        socket.off('integrationUpdated');
        socket.off('metricCreated');
        socket.off('integrationDeleted');
      };
    }
  }, [socket, id, joinIntegration, leaveIntegration, navigate]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!metrics || metrics.length === 0) return null;
    
    // Sort metrics by timestamp
    const sortedMetrics = [...metrics].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Format dates for x-axis
    const labels = sortedMetrics.map(metric => {
      const date = new Date(metric.timestamp);
      return timeframe === 'hour' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString();
    });
    
    // Get response times and success data
    const responseTimeData = sortedMetrics.map(metric => metric.responseTime);
    const dataVolumeData = sortedMetrics.map(metric => metric.dataVolume / 1024); // Convert to KB
    
    return {
      labels,
      datasets: [
        {
          label: 'Response Time (ms)',
          data: responseTimeData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Data Volume (KB)',
          data: dataVolumeData,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y1',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Response Time (ms)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Data Volume (KB)'
        }
      },
    },
  };

  // Calculate metrics summary
  const calculateMetricsSummary = () => {
    if (!metrics || metrics.length === 0) return null;
    
    const totalEvents = metrics.length;
    const successEvents = metrics.filter(m => m.status === 'Success').length;
    const failureEvents = metrics.filter(m => m.status === 'Failure').length;
    const warningEvents = metrics.filter(m => m.status === 'Warning').length;
    
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalEvents;
    const successRate = (successEvents / totalEvents) * 100;
    
    return {
      totalEvents,
      successEvents,
      failureEvents,
      warningEvents,
      avgResponseTime: avgResponseTime.toFixed(2),
      successRate: successRate.toFixed(2)
    };
  };

  if (loading) {
    return <div className="loading">Loading integration details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!integration) {
    return <div className="not-found">Integration not found</div>;
  }

  const metricsSummary = calculateMetricsSummary();
  const chartData = prepareChartData();

  return (
    <div className="integration-detail">
      <div className="page-header">
        <h2>{integration.name}</h2>
        <div className="integration-actions">
          <button 
            className="btn-edit" 
            onClick={() => navigate(`/integrations/edit/${integration._id}`)}
          >
            Edit Integration
          </button>
        </div>
      </div>
      
      <div className="integration-info">
        <div className="info-card">
          <h3>Integration Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`status-badge ${integration.status.toLowerCase()}`}>
                {integration.status}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span>{integration.type}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Source:</span>
              <span>{integration.source}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Destination:</span>
              <span>{integration.destination}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Created:</span>
              <span>{new Date(integration.createdAt).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Modified:</span>
              <span>
                {integration.lastModified 
                  ? new Date(integration.lastModified).toLocaleString() 
                  : 'Not modified'}
              </span>
            </div>
          </div>
          
          {integration.description && (
            <div className="description">
              <h4>Description</h4>
              <p>{integration.description}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="metrics-section">
        <div className="section-header">
          <h3>Performance Metrics</h3>
          <div className="timeframe-selector">
            <label>Timeframe: </label>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option value="hour">Last Hour</option>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
        
        {metricsSummary && (
          <div className="metrics-summary">
            <div className="metric-item">
              <span className="metric-label">Total Events</span>
              <span className="metric-value">{metricsSummary.totalEvents}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Success Rate</span>
              <span className="metric-value success">{metricsSummary.successRate}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Avg Response Time</span>
              <span className="metric-value">{metricsSummary.avgResponseTime} ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Failures</span>
              <span className="metric-value error">{metricsSummary.failureEvents}</span>
            </div>
          </div>
        )}
        
        {chartData && (
          <div className="chart-container">
            <MetricsChart 
              type="line" 
              data={chartData} 
              options={chartOptions} 
              height={300} 
            />
          </div>
        )}
        
        <div className="recent-events">
          <h4>Recent Events</h4>
          <table className="events-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Data Volume</th>
              </tr>
            </thead>
            <tbody>
              {metrics.slice(0, 10).map((metric) => (
                <tr key={metric._id}>
                  <td>{new Date(metric.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${metric.status.toLowerCase()}`}>
                      {metric.status}
                    </span>
                  </td>
                  <td>{metric.responseTime} ms</td>
                  <td>{(metric.dataVolume / 1024).toFixed(2)} KB</td>
                </tr>
              ))}
              {metrics.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-data">No events recorded in this timeframe</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDetail;
