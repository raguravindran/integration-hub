import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('day');

  useEffect(() => {
    // In a real app, this would fetch from your backend API
    // Example: fetchDashboardMetrics(timeframe)
    // For now, we'll use mock data
    const mockData = {
      statusCounts: [
        { _id: 'Success', count: 120 },
        { _id: 'Failure', count: 15 },
        { _id: 'Warning', count: 8 },
        { _id: 'Processing', count: 42 }
      ],
      responseTimesByIntegration: [
        { integrationName: 'CRM Integration', avgResponseTime: 230, successRate: 0.95 },
        { integrationName: 'ERP System', avgResponseTime: 450, successRate: 0.87 },
        { integrationName: 'Payment Gateway', avgResponseTime: 180, successRate: 0.99 },
        { integrationName: 'Data Warehouse', avgResponseTime: 820, successRate: 0.92 },
        { integrationName: 'Marketing API', avgResponseTime: 340, successRate: 0.88 }
      ]
    };
    
    setTimeout(() => {
      setMetricsData(mockData);
      setLoading(false);
    }, 1000); // Simulate loading
  }, [timeframe]);

  const statusChartData = {
    labels: metricsData?.statusCounts.map(item => item._id) || [],
    datasets: [
      {
        label: 'Status Distribution',
        data: metricsData?.statusCounts.map(item => item.count) || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const responseTimeChartData = {
    labels: metricsData?.responseTimesByIntegration.map(item => item.integrationName) || [],
    datasets: [
      {
        label: 'Avg Response Time (ms)',
        data: metricsData?.responseTimesByIntegration.map(item => item.avgResponseTime) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Success Rate (%)',
        data: metricsData?.responseTimesByIntegration.map(item => item.successRate * 100) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  const responseTimeChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Response Time (ms)'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        max: 100,
        title: {
          display: true,
          text: 'Success Rate (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-page">
      <h2>Integration Dashboard</h2>
      
      <div className="timeframe-selector">
        <label>Timeframe: </label>
        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
          <option value="hour">Last Hour</option>
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>
      
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h3>Integration Status</h3>
          <div className="chart-container">
            <Bar data={statusChartData} />
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>Response Times & Success Rates</h3>
          <div className="chart-container">
            <Line data={responseTimeChartData} options={responseTimeChartOptions} />
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>Integration Health</h3>
          <div className="metrics-summary">
            <div className="metric-item">
              <span className="metric-label">Total Integrations:</span>
              <span className="metric-value">5</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Active:</span>
              <span className="metric-value success">4</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Error:</span>
              <span className="metric-value error">1</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Avg. Success Rate:</span>
              <span className="metric-value">92%</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>Latest Events</h3>
          <div className="events-list">
            {/* This would be populated with real data in a complete implementation */}
            <div className="event-item">
              <span className="event-time">10:45 AM</span>
              <span className="event-description success">Payment Gateway - Transaction processed</span>
            </div>
            <div className="event-item">
              <span className="event-time">10:42 AM</span>
              <span className="event-description">Data Warehouse - Data sync completed</span>
            </div>
            <div className="event-item">
              <span className="event-time">10:38 AM</span>
              <span className="event-description error">ERP System - Connection timeout</span>
            </div>
            <div className="event-item">
              <span className="event-time">10:35 AM</span>
              <span className="event-description">CRM Integration - Contact updated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
