import React from 'react';

function RiskBadge({ riskLevel }) {
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <span className={`risk-badge risk-${getRiskColor(riskLevel)}`}>
      Risk Level: {riskLevel}
    </span>
  );
}

export default RiskBadge;
