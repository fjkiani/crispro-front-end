// Agent Status Types
export const AGENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft'
};

// Trigger Types
export const TRIGGER_TYPES = {
  MANUAL: 'manual',
  SCHEDULED: 'scheduled',
  EVENT: 'event'
};

// Scheduled Frequency Types
export const FREQUENCY_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly', 
  MONTHLY: 'monthly'
};

// Action Types
export const ACTION_TYPES = {
  DASHBOARD: 'dashboard',
  EMAIL: 'email',
  TEAM_COMMUNICATION: 'team_comms',
  PATIENT_RECORD: 'patient_record',
  REPORT: 'report'
};

// Weekdays for scheduling
export const WEEKDAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

// Months for scheduling
export const MONTHS = [
  { value: '1', label: '1st' },
  { value: '2', label: '2nd' },
  { value: '3', label: '3rd' },
  { value: '4', label: '4th' },
  { value: '5', label: '5th' },
  { value: '6', label: '6th' },
  { value: '7', label: '7th' },
  { value: '8', label: '8th' },
  { value: '9', label: '9th' },
  { value: '10', label: '10th' },
  { value: '11', label: '11th' },
  { value: '12', label: '12th' },
  { value: '13', label: '13th' },
  { value: '14', label: '14th' },
  { value: '15', label: '15th' },
  { value: '16', label: '16th' },
  { value: '17', label: '17th' },
  { value: '18', label: '18th' },
  { value: '19', label: '19th' },
  { value: '20', label: '20th' },
  { value: '21', label: '21st' },
  { value: '22', label: '22nd' },
  { value: '23', label: '23rd' },
  { value: '24', label: '24th' },
  { value: '25', label: '25th' },
  { value: '26', label: '26th' },
  { value: '27', label: '27th' },
  { value: '28', label: '28th' },
  { value: '29', label: '29th' },
  { value: '30', label: '30th' },
  { value: '31', label: '31st' }
];

// Hours for time selection
export const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, '0'),
  label: `${i.toString().padStart(2, '0')}:00`
})); 