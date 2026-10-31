import { supabase } from "@/lib/supabase";
import type { Complaint, HistoryEntry, Severity, Status } from "@/types";
import { failure, success, type ServiceResult } from "./api-client";
import { StorageService } from "./storage.service";

export type SubmitComplaintPayload = {
  idempotencyKey: string;
  title: string;
  description?: string;
  category: string;
  aiSuggestedCategory?: string;
  severity: Severity;
  aiSuggestion?: unknown;
  latitude: number;
  longitude: number;
  locationAccuracyM?: number | null;
  addressText?: string | null;
  locality?: string | null;
  postalCode?: string | null;
  photoPath: string;
  cityId: string;
  wardId?: string | null;
  citySource?: "gps" | "profile";
  outsideCityLimits?: boolean;
};

export const ComplaintsService = {
  /**
   * Submit complaint via atomic RPC with idempotency, auto-routing, and status history.
   */
  async submitComplaint(
    payload: SubmitComplaintPayload,
  ): Promise<ServiceResult<{ id: string; reference: string; status: Status; idempotentReplay: boolean }>> {
    try {
      const { data, error } = await supabase.rpc("submit_complaint", {
        p_idempotency_key: payload.idempotencyKey,
        p_title: payload.title.trim(),
        p_description: payload.description?.trim() || null,
        p_category: payload.category,
        p_ai_suggested_category: payload.aiSuggestedCategory || null,
        p_severity: payload.severity,
        p_ai_suggestion: payload.aiSuggestion ? JSON.parse(JSON.stringify(payload.aiSuggestion)) : null,
        p_latitude: payload.latitude,
        p_longitude: payload.longitude,
        p_location_accuracy_m: payload.locationAccuracyM ?? null,
        p_address_text: payload.addressText || null,
        p_locality: payload.locality || null,
        p_postal_code: payload.postalCode || null,
        p_photo_path: payload.photoPath,
        p_city_id: payload.cityId,
        p_ward_id: payload.wardId || null,
        p_city_source: payload.citySource ?? "gps",
        p_outside_city_limits: payload.outsideCityLimits ?? false,
      });

      if (error) return failure(error.message);

      return success({
        id: data.id,
        reference: data.reference,
        status: data.status as Status,
        idempotentReplay: Boolean(data.idempotent_replay),
      });
    } catch (err) {
      return failure(err, "Failed to submit complaint.");
    }
  },

  /**
   * Fetch all complaints filed by the current user (filtered by citizen_id via RLS).
   */
  async getMyComplaints(): Promise<ServiceResult<Complaint[]>> {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          id,
          reference,
          title,
          description,
          category,
          ai_suggested_category,
          severity,
          status,
          latitude,
          longitude,
          location_accuracy_m,
          address_text,
          locality,
          photo_path,
          created_at,
          resolved_at,
          resolution_notes,
          departments:assigned_department_id (name),
          cities:city_id (name),
          complaint_status_history (
            previous_status,
            new_status,
            citizen_visible_update,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (error) return failure(error.message);

      const items: Complaint[] = (data || []).map((row: any) => {
        const historyEntries: HistoryEntry[] = (row.complaint_status_history || []).map((h: any) => ({
          status: h.new_status as Status,
          at: h.created_at,
          update: h.citizen_visible_update ?? undefined,
        }));

        const resolvedPhoto = StorageService.getPublicPhotoUrl(row.photo_path);

        return {
          id: row.id,
          reference: row.reference,
          title: row.title,
          description: row.description ?? undefined,
          category: row.category,
          aiCategory: row.ai_suggested_category ?? undefined,
          severity: row.severity as Severity,
          status: row.status as Status,
          department: row.departments?.name ?? "Municipal Review",
          city: row.cities?.name ?? "",
          address: row.address_text ?? "",
          locality: row.locality ?? undefined,
          latitude: row.latitude,
          longitude: row.longitude,
          accuracyM: row.location_accuracy_m ?? undefined,
          photoUri: resolvedPhoto ?? null,
          createdAt: row.created_at,
          resolvedAt: row.resolved_at ?? undefined,
          resolutionNote: row.resolution_notes ?? undefined,
          history: historyEntries,
        };
      });

      return success(items);
    } catch (err) {
      return failure(err, "Failed to load complaints.");
    }
  },

  /**
   * Subscribe to real-time status updates for a specific complaint or user's complaints.
   */
  subscribeToComplaint(complaintId: string, onChange: (newStatus: Status) => void) {
    const channel = supabase
      .channel(`complaint-${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "complaints",
          filter: `id=eq.${complaintId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).status) {
            onChange((payload.new as any).status as Status);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
