import type { Severity, Status } from '@/types';

/** SLA targets in hours (owner decision, PRD FR-SLA-001). */
export const SLA_HOURS: Record<Severity, number> = {
  critical: 24,
  high: 72,
  medium: 168,
  low: 336,
};

export const SLA_LABEL: Record<Severity, string> = {
  critical: '24 hours',
  high: '3 days',
  medium: '7 days',
  low: '14 days',
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const STATUS_LABEL: Record<Status, string> = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  under_review: 'Under review',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected',
};

const DONE: Status[] = ['resolved', 'closed', 'rejected'];

export function isOpen(status: Status) {
  return !DONE.includes(status);
}

export function dueAt(createdAt: string, severity: Severity): Date {
  return new Date(new Date(createdAt).getTime() + SLA_HOURS[severity] * 3600_000);
}

export function isOverdue(createdAt: string, severity: Severity, status: Status, now = new Date()) {
  return isOpen(status) && now > dueAt(createdAt, severity);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

/** "28 Oct, 10:24" in the device's local time. */
export function formatDateTime(iso: string | Date) {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "28 OCT · 10:24" for timelines. */
export function formatStamp(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].toUpperCase()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function timeAgo(iso: string, now = new Date()) {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

/** "2 d 6 h" */
export function formatDuration(fromIso: string, toIso: string) {
  const hours = Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 3600000));
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  return d > 0 ? `${d} d ${h} h` : `${h} h`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}
