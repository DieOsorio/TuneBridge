import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProfileAvatar from "./ProfileAvatar";
import Select from "../ui/Select";
import { uploadFileToBucket } from "../../utils/avatarUtils";
import { useView } from "../../context/ViewContext";
import ImageUploader from "../../utils/ImageUploader";
import { IoIosCamera } from "react-icons/io";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";

const EditProfile = ({ profile, onSave, onCancel }) => {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { manageView } = useView();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      bio: "",
      username: "",
      gender: "",
      country: "",
      birthdate: "",
      city: "",
      firstname: "",
      lastname: "",
    },
  });

  const [avatar_url, setAvatar_url] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState("");

  const avatarClickRef = useRef(null);

  useEffect(() => {
    if (profile) {
      reset({
        bio: profile.bio || "",
        username: profile.username || "",
        gender: profile.gender || "",
        country: profile.country || "",
        birthdate: profile.birthdate ? new Date(profile.birthdate) : "",
        city: profile.city || "",
        firstname: profile.firstname || "",
        lastname: profile.lastname || "",
      });
      setAvatar_url(profile.avatar_url || "");
    }
  }, [profile, reset]);

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
    setLocalError("");

    try {
      let avatar = avatar_url;

      if (selectedFile) {
        // Use the generalized function to upload the avatar
        avatar = await uploadFileToBucket(
          selectedFile, 
          "avatars", 
          user.id, 
          avatar_url,
          true,
        );
        setAvatar_url(avatar);
      }

      await updateProfile({
        ...data,
        avatar_url: avatar,
        id: user.id,
      });

      manageView("about", "profile");
      if (onSave) onSave();
    } catch (error) {
      setLocalError(error.message || "Error updating profile.");
    }
  };

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">Edit Profile</h2>
      {user && (
        <div
          ref={avatarClickRef}
          className="relative w-fit mx-auto cursor-pointer group"
        >
          <ProfileAvatar avatar_url={preview || avatar_url} />
          <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md group-hover:opacity-100 opacity-80 transition-opacity">
            <IoIosCamera size={20} className="text-gray-700" />
          </div>
        </div>
      )}
      <div className="my-4">
        <ImageUploader
          onFilesUpdate={handleAvatarUpdate}
          amount={1}
          triggerRef={avatarClickRef}
        />
      </div>
      {localError && (
        <p className="text-red-500 text-sm text-center">{localError}</p>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="sm:col-span-2">
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-400"
          >
            Bio
          </label>
          <textarea
            id="bio"
            {...register("bio", {
              maxLength: {
                value: 100,
                message: "Bio cannot exceed 100 characters",
              },
            })}
            placeholder="Bio"            
            className="mt-1 block w-full rounded-md border shadow-sm border-gray-400 sm:text-sm h-24 resize-none p-2"
          />
          {errors.bio && (
            <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {watch("bio")?.length || 0}/100 characters used
          </p>
        </div>        
        <Input
          label="First name"
          placeholder="First name"
          {...register("firstname")}
        />
        <Input
          label="Last name"
          placeholder="Last name"
          {...register("lastname")}
        />
        <Input
          label="Country"
          placeholder="Country"
          {...register("country")}
        />
        <Input
          label="City"
          placeholder="City"
          {...register("city")}
        />

        <Input
          label="Username"
          placeholder="Username"
          {...register("username", { 
            required: "Username is required",
          maxLength: {
            value: 12,
            message: "Username cannot exceed 12 characters",
          },
          pattern: {
            value: /^[a-zA-Z0-9_.-]+$/,
            message: "Username can only contain letters, numbers, underscores, hyphens, and periods",
          },
        })}
          error={errors.username?.message}
        />
        <Select
          label="Gender"
          {...register("gender")}
          defaultOption="Choose your gender"
          options={["Male", "Female", "Other"]}
        />

        <div className="sm:col-span-2">
          <label
            htmlFor="birthdate"
            className="block text-sm font-medium mb-2 text-gray-400"
          >
            Birthdate
          </label>
          <DatePicker
            value={watch("birthdate")} // Bind the selected date to the form state
            onChange={(date) => setValue("birthdate", date)} // Update the form state when a new date is selected
          />
        </div>
        <div className="sm:col-span-2 flex justify-end mt-4">
          <Button className="mt-8" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button
            className="mt-8 ml-4 !bg-gray-500 hover:!bg-gray-600 text-white"
            type="button"
            onClick={() => {
              manageView("about", "profile");
              if (onCancel) onCancel();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
