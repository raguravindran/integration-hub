import React from 'react';
import { Line, Bar } from 'react-chartjs-2';

const MetricsChart = ({ 
  type = 'line', 
  data, 
  options, 
  height = 250
}) => {
  // Default options based on chart type
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  const chartOptions = { ...defaultOptions, ...options };
  
  // Chart component based on type
  const renderChart = () => {
    switch (type.toLowerCase()) {
      case 'bar':
        return <Bar data={data} options={chartOptions} height={height} />;
      case 'line':
      default:
        return <Line data={data} options={chartOptions} height={height} />;
    }
  };

  return (
    <div className="metrics-chart" style={{ height }}>
      {renderChart()}
    </div>
  );
};

export default MetricsChart;
