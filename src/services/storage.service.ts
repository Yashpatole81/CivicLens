import { supabase } from "@/lib/supabase";
import { failure, success, type ServiceResult } from "./api-client";

const BUCKET_NAME = "complaint-photos";

// Pure JS base64 to Uint8Array decoder (resilient across React Native runtimes)
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const LOOKUP = new Uint8Array(256);
for (let i = 0; i < CHARS.length; i++) {
  LOOKUP[CHARS.charCodeAt(i)] = i;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, "");
  let bufferLength = clean.length * 0.75;
  if (clean.endsWith("==")) bufferLength -= 2;
  else if (clean.endsWith("=")) bufferLength -= 1;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const b1 = LOOKUP[clean.charCodeAt(i)];
    const b2 = LOOKUP[clean.charCodeAt(i + 1)];
    const b3 = LOOKUP[clean.charCodeAt(i + 2)];
    const b4 = LOOKUP[clean.charCodeAt(i + 3)];

    bytes[p++] = (b1 << 2) | (b2 >> 4);
    if (b3 !== 64 && p < bufferLength) {
      bytes[p++] = ((b2 & 15) << 4) | (b3 >> 2);
    }
    if (b4 !== 64 && p < bufferLength) {
      bytes[p++] = ((b3 & 3) << 6) | (b4 & 63);
    }
  }
  return bytes;
}

export const StorageService = {
  /**
   * Resolve relative Supabase storage photo_path to a full public URL.
   */
  getPublicPhotoUrl(photoPath: string | null | undefined): string | null {
    if (!photoPath || photoPath === "placeholder.jpg") return null;
    if (
      photoPath.startsWith("http://") ||
      photoPath.startsWith("https://") ||
      photoPath.startsWith("file://")
    ) {
      return photoPath;
    }
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(photoPath);
    return data?.publicUrl || null;
  },

  /**
   * Upload an image to the complaint-photos bucket.
   * Path convention: `<citizen_id>/<timestamp>-<random>.jpg`
   */
  async uploadComplaintPhoto(
    citizenId: string,
    fileUri: string,
    base64Data?: string | null,
  ): Promise<ServiceResult<{ photoPath: string }>> {
    try {
      const filename = `${citizenId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

      let bodyData: any;
      if (base64Data) {
        bodyData = base64ToUint8Array(base64Data);
      } else {
        const response = await fetch(fileUri);
        bodyData = await response.blob();
      }

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, bodyData, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        console.warn("[CivicLens Storage] Upload failed:", error.message);
        return failure(error.message);
      }

      return success({ photoPath: data.path });
    } catch (err) {
      console.warn("[CivicLens Storage] Upload error:", err);
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
