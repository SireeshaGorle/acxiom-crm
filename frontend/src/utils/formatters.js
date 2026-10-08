export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'WON':
    case 'COMPLETED':
    case 'CONVERTED':
      return 'bg-success text-white';
    case 'INACTIVE':
    case 'LOST':
    case 'MISSED':
    case 'CANCELLED':
      return 'bg-danger text-white';
    case 'QUALIFIED':
    case 'NEGOTIATION':
    case 'IN_PROGRESS':
      return 'bg-warning text-dark';
    case 'CONTACTED':
    case 'PROPOSAL':
      return 'bg-info text-dark';
    case 'NEW':
    case 'PLANNED':
    case 'OPEN':
      return 'bg-primary text-white';
    default:
      return 'bg-secondary text-white';
  }
};
