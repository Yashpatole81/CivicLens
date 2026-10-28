/**
 * In-memory app state for the frontend-only phase (fake auth, complaints,
 * the in-progress complaint draft, staff session). Swapped for Supabase later.
 */
import { createContext, useContext, useState, type ReactNode } from "react";

import { getCategory } from "@/data/categories";
import {
  DEMO_STAFF,
  DEMO_USER,
  DEMO_USER_COMPLAINT_IDS,
  MORE_COMPLAINTS,
  SEED_COMPLAINTS,
  type StaffUser,
} from "@/data/mock";
import { canManage, canReassign, isStaff } from "@/lib/access";
import { NEEDS_NOTE, NEXT_STATUS } from "@/lib/workflow";
import type { AiSuggestion, Complaint, Severity, Status } from "@/types";

export type User = typeof DEMO_USER;

export type DraftLocation = {
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  address: string | null;
  locality: string | null;
  city: string | null;
};

export type Draft = {
  photoUri: string | null;
  location: DraftLocation | null;
  description: string;
  suggestion: AiSuggestion | null;
  category: string | null;
  title: string;
  /** True once the citizen types their own title; until then it follows the category. */
  titleEdited: boolean;
  severity: Severity;
  presetGroup: string | null;
};

const EMPTY_DRAFT: Draft = {
  photoUri: null,
  location: null,
  description: "",
  suggestion: null,
  category: null,
  title: "",
  titleEdited: false,
  severity: "medium",
  presetGroup: null,
};

/** Max lengths, mirrored from PRD Security §7. */
export const LIMITS = { title: 140, description: 2000, note: 2000 } as const;

type ActionResult = { ok: true } | { ok: false; error: string };

type AppState = {
  user: User | null;
  signIn: (email: string) => void;
  signOut: () => void;
  pendingEmail: string | null;
  register: (user: User) => void;

  staff: StaffUser | null;
  staffSignIn: (email: string) => ActionResult;
  staffSignOut: () => void;

  complaints: Complaint[];
  myComplaintIds: string[];
  getComplaint: (id: string) => Complaint | undefined;
  submitDraft: () => Complaint;
  updateStatus: (id: string, status: Status, update?: string) => ActionResult;
  updateComplaint: (
    id: string,
    patch: { category?: string; severity?: Severity; internalNote?: string },
  ) => ActionResult;

  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
  resetDraft: (presetGroup?: string | null) => void;
};

const AppContext = createContext<AppState | null>(null);

function nextReference(list: Complaint[]) {
  const year = new Date().getFullYear();
  const max = list.reduce(
    (m, c) => Math.max(m, Number(c.reference.split("-")[2]) || 0),
    0,
  );
  return `CL-${year}-${String(max + 1).padStart(6, "0")}`;
}

const DENIED: ActionResult = {
  ok: false,
  error: "You don't have permission to change this complaint.",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [registered, setRegistered] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([
    ...SEED_COMPLAINTS,
    ...MORE_COMPLAINTS,
  ]);
  const [myComplaintIds, setMyComplaintIds] = useState<string[]>(
    DEMO_USER_COMPLAINT_IDS,
  );
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const value: AppState = {
    user,
    signIn: (email) => {
      const base =
        registered && registered.email === email ? registered : DEMO_USER;
      setUser({ ...base, email });
      setPendingEmail(null);
    },
    signOut: () => setUser(null),
    pendingEmail,
    register: (u) => {
      setRegistered(u);
      setPendingEmail(u.email);
    },

    staff,
    staffSignIn: (email) => {
      // Demo: role comes from the seeded account, never from anything the user types.
      const account = DEMO_STAFF.find(
        (s) => s.email === email.trim().toLowerCase(),
      );
      if (!account || !isStaff(account))
        return { ok: false, error: "This account has no staff access." };
      setStaff(account);
      return { ok: true };
    },
    staffSignOut: () => setStaff(null),

    complaints,
    myComplaintIds,
    getComplaint: (id) => complaints.find((c) => c.id === id),

    submitDraft: () => {
      const loc = draft.location!;
      const category = getCategory(draft.category ?? "other");
      const now = new Date().toISOString();
      const complaint: Complaint = {
        id: `local-${Date.now()}`,
        reference: nextReference(complaints),
        title: (draft.title.trim() || category.label).slice(0, LIMITS.title),
        description:
          draft.description.trim().slice(0, LIMITS.description) || undefined,
        category: category.code,
        aiCategory:
          draft.suggestion?.source === "model"
            ? draft.suggestion.category
            : undefined,
        severity: draft.severity,
        status: "assigned",
        department: category.department,
        city: loc.city ?? user?.city ?? "Unknown",
        address: loc.address ?? "Address not available",
        locality: loc.locality ?? undefined,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracyM: loc.accuracyM ?? undefined,
        photoUri: draft.photoUri,
        createdAt: now,
        history: [
          { status: "submitted", at: now },
          { status: "assigned", at: now },
        ],
      };
      setComplaints((list) => [complaint, ...list]);
      setMyComplaintIds((ids) => [complaint.id, ...ids]);
      return complaint;
    },

    updateStatus: (id, status, update) => {
      const c = complaints.find((x) => x.id === id);
      if (!c || !canManage(staff, c)) return DENIED;
      // Same status = a public progress update with no transition.
      const sameStatus = status === c.status;
      if (!sameStatus && !NEXT_STATUS[c.status].includes(status))
        return { ok: false, error: "That status change is not allowed." };
      const note = update?.trim().slice(0, LIMITS.note) ?? "";
      if (sameStatus && !note) return { ok: false, error: "Write an update first." };
      if (!sameStatus && NEEDS_NOTE.includes(status) && !note) {
        return {
          ok: false,
          error:
            status === "resolved"
              ? "Add a resolution note first."
              : "Add a rejection reason first.",
        };
      }
      const at = new Date().toISOString();
      setComplaints((list) =>
        list.map((x) =>
          x.id !== id
            ? x
            : {
              ...x,
              status,
              resolvedAt: status === "resolved" ? at : x.resolvedAt,
              resolutionNote: status === "resolved" ? note : x.resolutionNote,
              rejectionReason:
                status === "rejected" ? note : x.rejectionReason,
              history: [
                ...x.history,
                { status, at, update: note || undefined },
              ],
            },
        ),
      );
      return { ok: true };
    },

    updateComplaint: (id, patch) => {
      const c = complaints.find((x) => x.id === id);
      if (!c || !canManage(staff, c)) return DENIED;
      if (
        patch.category &&
        patch.category !== c.category &&
        !canReassign(staff)
      ) {
        return {
          ok: false,
          error: "Only admins can change the category or department.",
        };
      }
      setComplaints((list) =>
        list.map((x) => {
          if (x.id !== id) return x;
          const category = patch.category ? getCategory(patch.category) : null;
          return {
            ...x,
            ...(category
              ? { category: category.code, department: category.department }
              : {}),
            ...(patch.severity ? { severity: patch.severity } : {}),
            ...(patch.internalNote !== undefined
              ? { internalNote: patch.internalNote.slice(0, LIMITS.note) }
              : {}),
          };
        }),
      );
      return { ok: true };
    },

    draft,
    updateDraft: (patch) => setDraft((d) => ({ ...d, ...patch })),
    resetDraft: (presetGroup = null) =>
      setDraft({ ...EMPTY_DRAFT, presetGroup }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
