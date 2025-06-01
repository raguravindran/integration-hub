import React from 'react';
import { useParams } from 'react-router-dom';
import IntegrationDetail from '../components/IntegrationDetail';

const IntegrationDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div className="page-container">
      <IntegrationDetail />
    </div>
  );
};

export default IntegrationDetailPage;
