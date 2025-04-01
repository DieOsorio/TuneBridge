import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a new avatar and removes old avatars from the user's folder.
 * @param {File} selectedFile - The new avatar file to upload.
 * @param {string} userId - The ID of the user.
 * @param {string} currentAvatarUrl - The current avatar URL (optional).
 * @returns {string|null} - The public URL of the new avatar or null if an error occurs.
 */
export const uploadAvatar = async (selectedFile, userId, currentAvatarUrl) => {
  if (!selectedFile) return currentAvatarUrl;

  try {
    const filePath = `${userId}/${uuidv4()}`; // Generate a unique file path for the new avatar

    // Upload the new avatar
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get the public URL of the uploaded avatar
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (urlError) throw urlError;

    const newAvatarUrl = publicUrlData?.publicUrl;

    // List all files in the user's folder
    const { data: files, error: listError } = await supabase.storage
      .from("avatars")
      .list(userId);

    if (listError) throw listError;

    // Filter out the newly uploaded file and delete the rest
    const filesToDelete = files
      .filter((file) => file.name !== filePath.split("/")[1]) // Exclude the new file
      .map((file) => `${userId}/${file.name}`); // Get full paths for deletion

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove(filesToDelete);

      if (deleteError) throw deleteError;
    }

    return newAvatarUrl; // Return the new avatar URL
  } catch (err) {
    console.error("Error uploading avatar:", err.message);
    return currentAvatarUrl; // Return the current avatar URL if an error occurs
  }
};