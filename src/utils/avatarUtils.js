import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file to a specified bucket and removes old files from the folder.
 * @param {File} selectedFile - The file to upload.
 * @param {string} bucketName - The name of the Supabase storage bucket.
 * @param {string} folderId - The folder ID (e.g., userId or groupId).
 * @param {string} currentFileUrl - The current file URL (optional).
 * @returns {string|null} - The public URL of the new file or null if an error occurs.
 */
export const uploadFileToBucket = async (selectedFile, bucketName, folderId, currentFileUrl) => {
  if (!selectedFile) return currentFileUrl;

  try {
    const filePath = `${folderId}/${uuidv4()}`; // Generate a unique file path for the new file

    // Upload the new file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get the public URL of the uploaded file
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (urlError) throw urlError;

    const newFileUrl = publicUrlData?.publicUrl;

    // List all files in the folder
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list(folderId);

    if (listError) throw listError;

    // Filter out the newly uploaded file and delete the rest
    const filesToDelete = files
      .filter((file) => file.name !== filePath.split("/")[1]) // Exclude the new file
      .map((file) => `${folderId}/${file.name}`); // Get full paths for deletion

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove(filesToDelete);

      if (deleteError) throw deleteError;
    }

    return newFileUrl; // Return the new file URL
  } catch (err) {
    console.error(`Error uploading file to bucket "${bucketName}":`, err.message);
    return currentFileUrl; // Return the current file URL if an error occurs
  }
};