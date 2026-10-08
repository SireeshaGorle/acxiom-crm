import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/formatters.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const OpportunityPipelineChart = ({ chartData }) => {
  if (!chartData || !chartData.labels || !chartData.amounts) {
    return <div className="text-center py-4 text-muted small">No pipeline data available</div>;
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Pipeline Value ($)',
        data: chartData.amounts,
        backgroundColor: [
          'rgba(100, 116, 139, 0.85)', // Qualification
          'rgba(6, 182, 212, 0.85)',   // Proposal
          'rgba(245, 158, 11, 0.85)',   // Negotiation
          'rgba(16, 185, 129, 0.85)',   // Won
          'rgba(239, 68, 68, 0.85)'     // Lost
        ],
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => ` Value: ${formatCurrency(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter' } }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 10, family: 'Inter' },
          callback: (value) => `$${value >= 1000 ? `${value / 1000}k` : value}`
        }
      }
    }
  };

  return (
    <div style={{ height: '260px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};
