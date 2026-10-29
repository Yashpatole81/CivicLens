import { supabase } from "@/lib/supabase";
import { failure, success, type ServiceResult } from "./api-client";

export type UserRole = "citizen" | "officer" | "admin";

export type UserProfile = {
  id: string;
  fullName: string;
  role: UserRole;
  departmentId: string | null;
  cityId: string | null;
  wardId: string | null;
  phone: string | null;
  createdAt: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  fullName: string;
  city?: string;
  cityId: string;
  ward?: string | null;
  wardId?: string | null;
  phone?: string | null;
};

export const AuthService = {
  /** Register a citizen user with metadata; profile is created by trigger. */
  async signUp(payload: SignUpPayload): Promise<ServiceResult<{ userId: string }>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email.trim(),
        password: payload.password,
        options: {
          data: {
            full_name: payload.fullName.trim(),
            city: payload.city || null,
            city_id: payload.cityId,
            ward: payload.ward || null,
            ward_id: payload.wardId || null,
            phone: payload.phone?.trim() || null,
          },
        },
      });

      if (error) return failure(error.message);
      if (!data.user) return failure("Failed to create user account.");

      return success({ userId: data.user.id });
    } catch (err) {
      return failure(err, "Sign up failed.");
    }
  },

  /** Sign in with email and password. */
  async signIn(email: string, password: string): Promise<ServiceResult<{ userId: string }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return failure(error.message);
      if (!data.user) return failure("Login failed: no user returned.");

      return success({ userId: data.user.id });
    } catch (err) {
      return failure(err, "Sign in failed.");
    }
  },

  /** Sign out and clear cached auth sessions. */
  async signOut(): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return failure(error.message);
      return success(true);
    } catch (err) {
      return failure(err, "Sign out failed.");
    }
  },

  /** Get active session user id. */
  async getCurrentUserId(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.user?.id ?? null;
    } catch {
      return null;
    }
  },

  /** Fetch current profile and role from the profiles table. */
  async getProfile(userId: string): Promise<ServiceResult<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, department_id, city_id, ward_id, phone, created_at")
        .eq("id", userId)
        .single();

      if (error) return failure(error.message);

      return success({
        id: data.id,
        fullName: data.full_name,
        role: data.role as UserRole,
        departmentId: data.department_id,
        cityId: data.city_id,
        wardId: data.ward_id,
        phone: data.phone,
        createdAt: data.created_at,
      });
    } catch (err) {
      return failure(err, "Could not fetch profile.");
    }
  },

  /** Subscribe to auth state changes (login, logout, token refresh). */
  onAuthStateChange(callback: (userId: string | null) => void) {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user?.id ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  },
};

