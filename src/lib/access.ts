/**
 * Role-based access rules for the municipal dashboard (PRD Security §3).
 *
 * IMPORTANT: these run in the browser, so they only shape the UI. They are
 * NOT a security boundary. The same rules must be enforced server-side with
 * Supabase RLS + Edge Functions before any real data is connected.
 */
import type { StaffUser } from '@/data/mock';
import type { Complaint } from '@/types';

export const isAdmin = (s: StaffUser | null) => s?.role === 'admin';
export const isStaff = (s: StaffUser | null) => s?.role === 'admin' || s?.role === 'officer';

/** Officers see only their department; admins see everything. */
export function canView(s: StaffUser | null, c: Complaint) {
  if (!isStaff(s)) return false;
  return isAdmin(s) || c.department === s!.department;
}

/** Status updates, public updates, internal notes, severity override. */
export const canManage = canView;

/** Changing category (and therefore department) is a reassignment: admin only. */
export const canReassign = (s: StaffUser | null) => isAdmin(s);

/** Admin-only pages. */
export const ADMIN_ONLY_PATHS = ['/admin/users', '/admin/sla', '/admin/categories'];
