import type { Status } from '@/types';

/** Allowed officer transitions (PRD Screen Flow §Screen 10). */
export const NEXT_STATUS: Record<Status, Status[]> = {
  submitted: ['assigned'],
  assigned: ['under_review', 'rejected'],
  under_review: ['in_progress', 'rejected'],
  in_progress: ['resolved'],
  resolved: ['closed'],
  closed: [],
  rejected: [],
};

/** Transitions that must include a note (resolution note or rejection reason). */
export const NEEDS_NOTE: Status[] = ['resolved', 'rejected'];
