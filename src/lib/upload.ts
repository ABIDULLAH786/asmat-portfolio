"use client";
import { supabaseBrowser } from "@/lib/supabase/client";

export type Bucket = "logos" | "profiles" | "projects" | "resumes" | "notes" | "thumbnails";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadToBucket(bucket: Bucket, file: File): Promise<string> {
  const sb = supabaseBrowser();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(file.name)}`;
  const { error } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Best-effort delete an object given its public URL. Returns true if deleted. */
export async function deleteByPublicUrl(bucket: Bucket, publicUrl: string | null): Promise<boolean> {
  if (!publicUrl) return false;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return false;
  const path = publicUrl.slice(idx + marker.length);
  const sb = supabaseBrowser();
  const { error } = await sb.storage.from(bucket).remove([path]);
  return !error;
}
