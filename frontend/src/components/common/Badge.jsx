import React from 'react';
import { getStatusBadgeClass } from '../../utils/formatters.js';

export const Badge = ({ status, text }) => {
  const badgeClass = getStatusBadgeClass(status);
  const displayText = text || status?.replace(/_/g, ' ') || 'Unknown';

  return (
    <span className={`badge badge-custom ${badgeClass}`}>
      {displayText}
    </span>
  );
};
