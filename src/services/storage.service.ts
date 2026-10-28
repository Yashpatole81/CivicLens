import { supabase } from "@/lib/supabase";
import { failure, success, type ServiceResult } from "./api-client";

const BUCKET_NAME = "complaint-photos";

export const StorageService = {
  /**
   * Upload an image to the private complaint-photos bucket.
   * Path convention: `<citizen_id>/<timestamp>-<random>.jpg`
   */
  async uploadComplaintPhoto(
    citizenId: string,
    fileUri: string,
  ): Promise<ServiceResult<{ photoPath: string }>> {
    try {
      const filename = `${citizenId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

      // Read file as blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        return failure(error.message);
      }

      return success({ photoPath: data.path });
    } catch (err) {
      return failure(err, "Failed to upload photo to storage.");
    }
  },

  /**
   * Create a short-lived signed URL for viewing a private photo (expires in 15 mins).
   */
  async getSignedPhotoUrl(photoPath: string, expiresInSeconds = 900): Promise<ServiceResult<string>> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(photoPath, expiresInSeconds);

      if (error) return failure(error.message);
      return success(data.signedUrl);
    } catch (err) {
      return failure(err, "Could not generate photo URL.");
    }
  },
};

