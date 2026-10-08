import React from 'react';

export const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => {
  return (
    <div className="card-custom stat-card h-100">
      <div>
        <div className="stat-title mb-1">{title}</div>
        <div className="stat-number">{value}</div>
        {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
      </div>
      <div className={`stat-icon-wrapper bg-${color} bg-opacity-10 text-${color}`}>
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  );
};
