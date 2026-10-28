export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type Status =
  | 'submitted'
  | 'assigned'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';

export type HistoryEntry = {
  status: Status;
  at: string; // ISO timestamp
  /** Citizen-visible update from the officer, if any. */
  update?: string;
};

export type Complaint = {
  id: string;
  reference: string;
  title: string;
  description?: string;
  category: string;
  aiCategory?: string;
  severity: Severity;
  status: Status;
  department: string;
  city: string;
  address: string;
  locality?: string;
  latitude: number;
  longitude: number;
  accuracyM?: number;
  /** Local image URI, or null for seeded demo rows (a placeholder is drawn). */
  photoUri: string | null;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  rejectionReason?: string;
  /** Staff-only note. Never rendered on citizen screens. */
  internalNote?: string;
  history: HistoryEntry[];
  isDemo?: boolean;
};

/** Structured AI suggestion (PRD AI Spec §3). */
export type AiSuggestion = {
  source: 'model' | 'fallback';
  category: string;
  title: string;
  summary: string;
  severity: Severity;
  observations: string[];
  confidence: number | null;
  needsClarification: boolean;
};
