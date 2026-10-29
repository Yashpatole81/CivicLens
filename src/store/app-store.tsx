/**
 * CivicLens Production State Store:
 * Handles Authentication, Complaints sync, Triage Queue, and Drafts.
 * Bridges Supabase Cloud Backend (Postgres, Storage, Auth, Realtime)
 * with Offline-First resilient fallback.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
import {
  AuthService,
  ComplaintsService,
  OfficerService,
  StorageService,
} from "@/services";
import type { AiSuggestion, Complaint, Severity, Status } from "@/types";

export type User = {
  fullName: string;
  email: string;
  country: string;
  state: string;
  city: string;
  cityId: string;
  ward?: string | null;
  wardId?: string | null;
  id?: string;
  phone?: string | null;
  role?: string;
};

export type DraftLocation = {
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  address: string | null;
  locality: string | null;
  city: string | null;
  wardId?: string | null;
  ward?: string | null;
  postalCode?: string | null;
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
  signIn: (email: string, password?: string) => Promise<ActionResult>;
  signOut: () => Promise<void>;
  pendingEmail: string | null;
  register: (user: User, password?: string) => Promise<ActionResult>;

  staff: StaffUser | null;
  staffSignIn: (email: string) => ActionResult;
  staffSignOut: () => void;

  complaints: Complaint[];
  myComplaintIds: string[];
  getComplaint: (id: string) => Complaint | undefined;
  submitDraft: () => Promise<Complaint>;
  updateStatus: (id: string, status: Status, update?: string) => Promise<ActionResult>;
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

  // Sync session and complaints on mount
  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;

    async function initSession() {
      const currentUserId = await AuthService.getCurrentUserId();
      if (currentUserId) {
        const profileRes = await AuthService.getProfile(currentUserId);
        if (profileRes.data) {
          setUser({
            id: profileRes.data.id,
            fullName: profileRes.data.fullName,
            email: "", // Fetched from auth user
            country: "IN",
            state: "IN-MH",
            city: "Pune",
            cityId: profileRes.data.cityId ?? "c1111111-1111-1111-1111-111111111101",
            phone: profileRes.data.phone,
            role: profileRes.data.role,
          });
        }

        // Fetch real complaints from Supabase
        const complaintsRes = await ComplaintsService.getMyComplaints();
        if (complaintsRes.data && complaintsRes.data.length > 0) {
          setComplaints(complaintsRes.data);
          setMyComplaintIds(complaintsRes.data.map((c) => c.id));
        }
      }
    }

    initSession();

    unsubscribeAuth = AuthService.onAuthStateChange(async (uid) => {
      if (!uid) {
        setUser(null);
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  const value: AppState = {
    user,
    signIn: async (email, password) => {
      if (password && process.env.EXPO_PUBLIC_SUPABASE_URL) {
        const res = await AuthService.signIn(email, password);
        if (!res.data) {
          return { ok: false, error: res.error };
        }
        const profile = await AuthService.getProfile(res.data.userId);
        if (profile.data) {
          setUser({
            id: profile.data.id,
            fullName: profile.data.fullName,
            email,
            country: "IN",
            state: "IN-MH",
            city: "Pune",
            cityId: profile.data.cityId ?? "c1111111-1111-1111-1111-111111111101",
            phone: profile.data.phone,
            role: profile.data.role,
          });
          const complaintsRes = await ComplaintsService.getMyComplaints();
          if (complaintsRes.data && complaintsRes.data.length > 0) {
            setComplaints(complaintsRes.data);
            setMyComplaintIds(complaintsRes.data.map((c) => c.id));
          }
          return { ok: true };
        }
      }

      // Demo fallback
      const base = registered && registered.email === email ? registered : DEMO_USER;
      setUser({ ...base, email });
      setPendingEmail(null);
      return { ok: true };
    },

    signOut: async () => {
      await AuthService.signOut();
      setUser(null);
    },

    pendingEmail,

    register: async (u, password) => {
      if (password && process.env.EXPO_PUBLIC_SUPABASE_URL) {
        const res = await AuthService.signUp({
          email: u.email,
          password,
          fullName: u.fullName,
          cityId: u.cityId,
          wardId: u.wardId ?? undefined,
          phone: u.phone ?? undefined,
        });
        if (!res.data) {
          return { ok: false, error: res.error };
        }
      }
      setRegistered(u);
      setPendingEmail(u.email);
      return { ok: true };
    },

    staff,
    staffSignIn: (email) => {
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

    submitDraft: async () => {
      const loc = draft.location!;
      const category = getCategory(draft.category ?? "other");
      const now = new Date().toISOString();
      const idempotencyKey = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      // 1. Production Supabase flow
      const currentUserId = await AuthService.getCurrentUserId();
      if (currentUserId && draft.photoUri) {
        let photoPath = "placeholder.jpg";
        const uploadRes = await StorageService.uploadComplaintPhoto(currentUserId, draft.photoUri);
        if (uploadRes.data?.photoPath) {
          photoPath = uploadRes.data.photoPath;
        }

        const rpcRes = await ComplaintsService.submitComplaint({
          idempotencyKey,
          title: (draft.title.trim() || category.label).slice(0, LIMITS.title),
          description: draft.description.trim().slice(0, LIMITS.description) || undefined,
          category: category.code,
          aiSuggestedCategory: draft.suggestion?.source === "model" ? draft.suggestion.category : undefined,
          severity: draft.severity,
          aiSuggestion: draft.suggestion,
          latitude: loc.latitude,
          longitude: loc.longitude,
          locationAccuracyM: loc.accuracyM ?? null,
          addressText: loc.address ?? null,
          locality: loc.locality ?? null,
          postalCode: loc.postalCode ?? null,
          photoPath,
          cityId: user?.cityId ?? "c1111111-1111-1111-1111-111111111101",
          wardId: loc.wardId ?? user?.wardId ?? null,
        });

        if (rpcRes.data) {
          const complaint: Complaint = {
            id: rpcRes.data.id,
            reference: rpcRes.data.reference,
            title: (draft.title.trim() || category.label).slice(0, LIMITS.title),
            description: draft.description.trim().slice(0, LIMITS.description) || undefined,
            category: category.code,
            aiCategory: draft.suggestion?.source === "model" ? draft.suggestion.category : undefined,
            severity: draft.severity,
            status: rpcRes.data.status,
            department: category.department,
            city: loc.city ?? user?.city ?? "Unknown",
            address: loc.address ?? "Address not available",
            locality: loc.locality ?? undefined,
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracyM: loc.accuracyM ?? undefined,
            photoUri: draft.photoUri,
            createdAt: now,
            history: [{ status: "submitted", at: now }],
          };
          setComplaints((list) => [complaint, ...list]);
          setMyComplaintIds((ids) => [complaint.id, ...ids]);
          return complaint;
        }
      }

      // 2. Offline / Demo flow
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

    updateStatus: async (id, status, update) => {
      const c = complaints.find((x) => x.id === id);
      if (!c || !canManage(staff, c)) return DENIED;
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

      // If online staff session on Supabase
      if (!id.startsWith("local-") && process.env.EXPO_PUBLIC_SUPABASE_URL) {
        const res = await OfficerService.updateStatus({
          complaintId: id,
          newStatus: status,
          citizenUpdate: note || undefined,
          resolutionNotes: status === "resolved" ? note : undefined,
        });
        if (!res.data) {
          return { ok: false, error: res.error };
        }
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
