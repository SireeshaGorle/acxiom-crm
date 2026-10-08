import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/formatters.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const MonthlySalesChart = ({ chartData }) => {
  if (!chartData || !chartData.labels || !chartData.data) {
    return <div className="text-center py-4 text-muted small">No monthly sales data available</div>;
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Closed Won Revenue ($)',
        data: chartData.data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
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
          label: (context) => ` Revenue: ${formatCurrency(context.raw)}`
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
      <Line data={data} options={options} />
    </div>
  );
};
