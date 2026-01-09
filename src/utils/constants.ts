export const PLATFORMS = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  both: 'Both',
} as const

export const AGENT_STATUS_LABELS = {
  idle: 'Ready',
  running: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
} as const

export const MAX_SCRIPT_LENGTH = {
  youtube: 60, // seconds
  instagram: 90,
  both: 60,
} as const
