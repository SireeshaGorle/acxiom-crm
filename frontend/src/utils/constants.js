export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SALES_EXECUTIVE: 'SALES_EXECUTIVE'
};

export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New', color: 'primary' },
  { value: 'CONTACTED', label: 'Contacted', color: 'info' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'warning' },
  { value: 'UNQUALIFIED', label: 'Unqualified', color: 'secondary' },
  { value: 'CONVERTED', label: 'Converted', color: 'success' },
  { value: 'LOST', label: 'Lost', color: 'danger' }
];

export const LEAD_SOURCES = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'COLD_CALL', label: 'Cold Call' },
  { value: 'EXHIBITION', label: 'Exhibition' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'OTHER', label: 'Other' }
];

export const OPPORTUNITY_STAGES = [
  { value: 'QUALIFICATION', label: 'Qualification', defaultProb: 10, color: 'secondary' },
  { value: 'PROPOSAL', label: 'Proposal Sent', defaultProb: 40, color: 'info' },
  { value: 'NEGOTIATION', label: 'Negotiation', defaultProb: 75, color: 'warning' },
  { value: 'WON', label: 'Closed Won', defaultProb: 100, color: 'success' },
  { value: 'LOST', label: 'Closed Lost', defaultProb: 0, color: 'danger' }
];

export const OPPORTUNITY_STATUSES = [
  { value: 'OPEN', label: 'Open', color: 'primary' },
  { value: 'WON', label: 'Won', color: 'success' },
  { value: 'LOST', label: 'Lost', color: 'danger' }
];

export const FOLLOWUP_TYPES = [
  { value: 'CALL', label: 'Phone Call', icon: 'bi-telephone' },
  { value: 'MEETING', label: 'Meeting', icon: 'bi-people' },
  { value: 'EMAIL', label: 'Email', icon: 'bi-envelope' },
  { value: 'TASK', label: 'Task', icon: 'bi-check2-square' }
];

export const FOLLOWUP_STATUSES = [
  { value: 'PLANNED', label: 'Planned', color: 'primary' },
  { value: 'COMPLETED', label: 'Completed', color: 'success' },
  { value: 'MISSED', label: 'Missed', color: 'danger' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'secondary' }
];

export const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'Call', icon: 'bi-telephone' },
  { value: 'MEETING', label: 'Meeting', icon: 'bi-people' },
  { value: 'EMAIL', label: 'Email', icon: 'bi-envelope' },
  { value: 'TASK', label: 'Task', icon: 'bi-check2-square' }
];

export const ACTIVITY_STATUSES = [
  { value: 'PLANNED', label: 'Planned', color: 'secondary' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'warning' },
  { value: 'COMPLETED', label: 'Completed', color: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'danger' }
];
