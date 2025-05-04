import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useProfileGroups } from "../../context/profile/ProfileGroupsContext";
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Input from "../ui/Input";
import Button from "../ui/Button";
import ImageUploader from "../../utils/ImageUploader";
import ProfileAvatar from "./ProfileAvatar";
import { IoIosCamera } from "react-icons/io";
import { uploadFileToBucket } from "../../utils/avatarUtils";

const CreateProfileGroup = () => {
  const { createProfileGroup } = useProfileGroups();
  const { user } = useAuth(); // Get the current user
  const navigate = useNavigate(); // Initialize useNavigate
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatar_url, setAvatar_url] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const avatarClickRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleAvatarUpdate = (file) => {
    if (file.length > 0) {
      setSelectedFile(file[0]);
      setPreview(URL.createObjectURL(file[0]));
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      let avatar = avatar_url;

      // Handle avatar upload using the generalized function
      if (selectedFile) {
        avatar = await uploadFileToBucket(selectedFile, "group-avatars", data.name, avatar_url);
        setAvatar_url(avatar);
      }

      // Include the created_by field with the user's ID
      await createProfileGroup({ ...data, avatar_url: avatar, created_by: user.id });
      reset(); // Reset the form after successful submission
      setAvatar_url("");
      setPreview(null);

      // Redirect to profile/user.id
      navigate(`/profile/${user.id}`);
    } catch (err) {
      setError(err.message || "Failed to create the group.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Redirect to profile/user.id
    navigate(`/profile/${user.id}`);
  };

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">Create a Profile Group</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div ref={avatarClickRef} className="relative w-fit cursor-pointer group">
            <ProfileAvatar avatar_url={preview || avatar_url} />
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md group-hover:opacity-100 opacity-80 transition-opacity">
              <IoIosCamera size={20} className="text-gray-700" />
            </div>
          </div>
          <div className="my-4">
            <ImageUploader onFilesUpdate={handleAvatarUpdate} amount={1} triggerRef={avatarClickRef} />
          </div>
        </div>
        <Input
          label="Group Name"
          {...register("name", { required: "Group name is required" })}
          placeholder="Enter group name"
          error={errors.name?.message}
        />
        <label htmlFor="bio" className="block text-sm font-medium text-gray-400">
          Bio
        </label>
        <textarea
          id="bio"
          {...register("bio")}
          placeholder="Enter a short bio"
          className="mt-1 block w-full rounded-md border shadow-sm border-gray-400 sm:text-sm h-24 resize-none p-2"
        />
        <Input
          label="Country"
          {...register("country")}
          placeholder="Enter country"
        />
        <Input
          label="City"
          {...register("city")}
          placeholder="Enter city"
        />
        <Input
          label="Genre"
          {...register("genre")}
          placeholder="Enter genre"
        />
        <div className="flex justify-end space-x-4">
          <Button
            className="!bg-gray-500 hover:!bg-gray-600"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfileGroup;