import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Button } from "@mui/material";
import Select from "../ui/Select";
import { useHashtags } from "../../context/social/HashtagsContext";
import { useProfileHashtags } from "../../context/social/ProfileHashtagsContext";

const principalFields = new Set([
  "instrument",
  "composition_style",
  "production_type",
  "preferred_genres",
  "music_genre",
]);

const RoleEditor = ({
  role,
  profileId,
  details,
  refetch,
  addDetails,
  updateDetails,
  deleteDetails,
  fields,
  title,
}) => {
  const [editingDetail, setEditingDetail] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { upsertHashtag } = useHashtags();
  const { upsertProfileHashtag } = useProfileHashtags();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: fields.reduce((acc, field) => ({ ...acc, [field.name]: field.default || "" }), {}),
  });

  useEffect(() => {
    reset(fields.reduce((acc, field) => ({ ...acc, [field.name]: field.default || "" }), {}));
  }, [details, fields, reset]);


  const onSubmit = async (data) => {
    try {
      clearErrors("root");
      const isValid = fields.every(field => !field.required || data[field.name]?.trim());
      if (!isValid) {
        setError("root", { message: "All required fields must be filled." });
        return;
      }


      await addDetails({
        ...data,
        role_id: role.id,
        profile_id: profileId,
      });

      // Extract hashtags from principal fields
      const hashtags = [];
      for (const field of fields) {
        if (principalFields.has(field.name) && data[field.name]) {
          const values = data[field.name]
            .split(",")
            .map((val) => val.trim())
            .filter(Boolean);
          hashtags.push(...values.map((val) => `#${val.replace(/\s+/g, "")}`));
        }
      }

      try {
        const upsertedHashtags = await Promise.all(
          hashtags.map(async (tag) => {
            const hashtag = await upsertHashtag({ name: tag });
            return hashtag;
          })
        );
      
        await Promise.all(
          upsertedHashtags.map(async (hashtag) => {
            await upsertProfileHashtag({
              profile_id: profileId,
              hashtag_id: hashtag.id,
            });
          })
        );
        } catch (error) {
        console.error("Error while upserting profile hashtags:", error.message);
        }

      reset();
      setSuccessMessage(`${title} added successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    } catch (err) {
      console.error(`Error adding ${title.toLowerCase()}:`, err);
      setError("root", { message: `Failed to add ${title.toLowerCase()}. Please try again.` });
    }
  };

  const handleSaveDetail = async (detail) => {
    const updated = {
      ...detail,
      ...(editingDetail?.[detail.id] || {}),
    };

    const isValid = fields.every(field =>
      !field.required || updated[field.name]?.toString().trim()
    );

    if (!isValid) {
      setError("root", { message: "All required fields must be filled." });
      return;
    }

    try {
      await updateDetails(detail.id, { ...detail, ...updated });
      setSuccessMessage(`${title} updated successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setEditingDetail((prev) => {
        const { [detail.id]: _, ...rest } = prev || {};
        return rest;
      });
      refetch();
    } catch (err) {
      console.error(`Error updating ${title.toLowerCase()}:`, err);
      setError("root", { message: `Failed to update ${title.toLowerCase()}. Please try again.` });
    }
  };

  const handleDeleteDetail = async (id) => {
    console.log(`Deleting ${title.toLowerCase()} with ID:`, id);
    
    try {
      await deleteDetails(id);
      setSuccessMessage(`${title} deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    } catch (err) {
      console.error(`Error deleting ${title.toLowerCase()}:`, err);
      setError("root", { message: `Failed to delete ${title.toLowerCase()}. Please try again.` });
    }
  };

  return (
    <div className="text-gray-900">
      <h4 className="text-xl text-gray-200 font-semibold mb-4">{title}</h4>

      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}
      {errors.root && <p className="text-red-500 mb-2">{errors.root.message}</p>}

      <ul className="space-y-4">
        {details.map((detail) => (
          <li
            key={detail.id}
            className="bg-gray-100 p-4 rounded-2xl shadow-md border border-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {fields.map((field) => (
                <div key={field.name} className="text-sm">
                  <span className="font-medium text-gray-700">{field.label}:</span>
                  {field.type === "select" ? (
                    <select
                      value={editingDetail?.[detail.id]?.[field.name] ?? detail[field.name]}
                      onChange={(e) =>
                        setEditingDetail((prev) => ({
                          ...prev,
                          [detail.id]: {
                            ...prev?.[detail.id],
                            [field.name]: e.target.value,
                          },
                        }))
                      }
                      className="ml-2 p-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="">Choose one</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={editingDetail?.[detail.id]?.[field.name] ?? detail[field.name]}
                      onChange={(e) =>
                        setEditingDetail((prev) => ({
                          ...prev,
                          [detail.id]: {
                            ...prev?.[detail.id],
                            [field.name]: e.target.value,
                          },
                        }))
                      }
                      className="ml-2 p-2 border border-gray-300 rounded-md"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mx-auto">
              <Button
                onClick={() => handleSaveDetail(detail)}
                className="!bg-sky-500 !text-white !px-3 !rounded-xl flex gap-1 !text-sm hover:!bg-sky-600"                
              >
                <FiEdit2 size={15} />
                Save
              </Button>
              <Button
                onClick={() => handleDeleteDetail(detail.id)}
                className="!bg-red-500 !text-white !px-3 !rounded-xl !text-sm flex gap-1 hover:!bg-red-600"
              >
                <FiTrash2 size={17} />
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 bg-gray-100 p-6 rounded-2xl shadow-inner border border-white">
        <h5 className="text-md font-medium mb-4 text-gray-700">Add new {title.toLowerCase()}</h5>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.name}>
              {field.type === "select" ? (
                <Select
                  id={field.name}
                  label={field.label}
                  options={field.options}
                  register={register}
                  validation={{
                    required: field.required ? `${field.label} is required` : false,
                  }}
                  error={errors[field.name]}
                  className="bg-white focus:bg-white"
                  defaultOption="Choose one"
                />
              ) : (
                <Input
                  id={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  type={field.type || "text"}
                  register={register}
                  validation={{
                    required: field.required ? `${field.label} is required` : false,
                  }}
                  error={errors[field.name]?.message}
                  className="bg-white"    
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 w-full flex justify-center">
          <Button 
          type="submit"
          className="!text-white !w-1/2 !bg-green-600 !px-3 !rounded-xl flex gap-1 !text-sm hover:!bg-green-700"  
          >
          Add
        </Button>
        </div> 
      </form>
    </div>
  );
};

export default RoleEditor;
