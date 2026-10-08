import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const LeadStatusChart = ({ chartData }) => {
  if (!chartData || !chartData.labels || !chartData.data) {
    return <div className="text-center py-4 text-muted small">No lead status data available</div>;
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Leads Count',
        data: chartData.data,
        backgroundColor: [
          '#2563eb', // New - Blue
          '#06b6d4', // Contacted - Cyan
          '#f59e0b', // Qualified - Amber
          '#64748b', // Unqualified - Gray
          '#10b981', // Converted - Green
          '#ef4444'  // Lost - Red
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 11, family: 'Inter' }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} leads`
        }
      }
    },
    cutout: '68%'
  };

  return (
    <div style={{ height: '260px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};
