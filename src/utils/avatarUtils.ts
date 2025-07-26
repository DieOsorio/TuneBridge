import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file to a specified Supabase Storage bucket and optionally removes old files in the same folder.
 *
 * @param selectedFile - The file to be uploaded.
 * @param bucketName - The name of the Supabase Storage bucket.
 * @param folderId - The folder ID within the bucket (e.g., user ID, group ID).
 * @param currentFileUrl - The current file URL (optional, used as fallback).
 * @param deleteOldFiles - Whether to remove all previous files in the same folder (default: false).
 * @returns The public URL of the newly uploaded file, or the original URL (or empty string) if an error occurs or no file is selected.
 */
export const uploadFileToBucket = async (
  selectedFile: File | null | undefined,
  bucketName: string,
  folderId: string,
  currentFileUrl?: string | null,
  deleteOldFiles = false
): Promise<string> => {
  if (!selectedFile) return currentFileUrl ?? "";

  try {
    if (deleteOldFiles) {
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list(folderId);

      if (listError) throw listError;

      const filesToDelete = files.map((file) => `${folderId}/${file.name}`);

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove(filesToDelete);

        if (deleteError) throw deleteError;
      }
    }

    const fileExt = selectedFile.name.split(".").pop() ?? "";
    const filePath = `${folderId}/${uuidv4()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl ?? currentFileUrl ?? "";
  } catch (err: any) {
    console.error(
      `Error uploading file to bucket "${bucketName}":`,
      err?.message ?? err
    );
    return currentFileUrl ?? "";
  }
};
