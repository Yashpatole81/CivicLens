import { supabase } from "@/lib/supabase";
import type { Status } from "@/types";
import { failure, success, type ServiceResult } from "./api-client";

export type OfficerQueueItem = {
  id: string;
  reference: string;
  title: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  status: Status;
  departmentId: string;
  cityId: string;
  createdAt: string;
  dueAt: string;
  isOverdue: boolean;
  addressText: string | null;
  locality: string | null;
  photoPath: string;
};

export const OfficerService = {
  /**
   * Fetch complaints for officer's department or admin overview from complaints_with_sla view.
   */
  async getQueue(filterStatus?: Status): Promise<ServiceResult<OfficerQueueItem[]>> {
    try {
      let query = supabase
        .from("complaints_with_sla")
        .select(`
          id,
          reference,
          title,
          category,
          severity,
          status,
          assigned_department_id,
          city_id,
          created_at,
          due_at,
          is_overdue,
          address_text,
          locality,
          photo_path
        `)
        .order("created_at", { ascending: false });

      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) return failure(error.message);

      const items: OfficerQueueItem[] = (data || []).map((row: any) => ({
        id: row.id,
        reference: row.reference,
        title: row.title,
        category: row.category,
        severity: row.severity,
        status: row.status as Status,
        departmentId: row.assigned_department_id,
        cityId: row.city_id,
        createdAt: row.created_at,
        dueAt: row.due_at,
        isOverdue: Boolean(row.is_overdue),
        addressText: row.address_text,
        locality: row.locality,
        photoPath: row.photo_path,
      }));

      return success(items);
    } catch (err) {
      return failure(err, "Failed to load officer queue.");
    }
  },

  /**
   * Update complaint status with state-machine validation and citizen notifications.
   */
  async updateStatus(params: {
    complaintId: string;
    newStatus: Status;
    citizenUpdate?: string;
    resolutionNotes?: string;
    reassignDepartmentId?: string;
    reassignOfficerId?: string;
  }): Promise<ServiceResult<{ status: Status }>> {
    try {
      const { data, error } = await supabase.rpc("update_complaint_status", {
        p_complaint_id: params.complaintId,
        p_new_status: params.newStatus,
        p_citizen_update: params.citizenUpdate || null,
        p_resolution_notes: params.resolutionNotes || null,
        p_reassign_department_id: params.reassignDepartmentId || null,
        p_reassign_officer_id: params.reassignOfficerId || null,
      });

      if (error) return failure(error.message);

      return success({ status: data.status as Status });
    } catch (err) {
      return failure(err, "Failed to update complaint status.");
    }
  },

  /**
   * Post an internal staff comment or public update.
   */
  async addComment(params: {
    complaintId: string;
    body: string;
    visibility: "public" | "internal";
  }): Promise<ServiceResult<{ id: string }>> {
    try {
      const user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) return failure("Unauthorized");

      const { data, error } = await supabase
        .from("complaint_comments")
        .insert({
          complaint_id: params.complaintId,
          author_id: user.id,
          body: params.body.trim(),
          visibility: params.visibility,
        })
        .select("id")
        .single();

      if (error) return failure(error.message);

      return success({ id: data.id });
    } catch (err) {
      return failure(err, "Failed to post comment.");
    }
  },
};
