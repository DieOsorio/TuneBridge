import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { useHashtags } from "@/context/social/HashtagsContext";
import { useProfileHashtags } from "@/context/social/ProfileHashtagsContext";

import { Button } from "@mui/material";

import Select from "../ui/Select";
import Input from "../ui/Input";

interface Field {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  default?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface Detail {
  id: string | number;
  [key: string]: any;
}

interface Role {
  id: string | number;
  [key: string]: any;
}

interface RoleEditorProps {
  role: Role;
  profileId: string | number;
  details: Detail[];
  refetch: () => void;
  addDetails: (data: any) => Promise<any>;
  updateDetails: (id: string | number, data: any) => Promise<any>;
  deleteDetails: (id: string | number) => Promise<any>;
  fields: Field[];
  title: string;
}

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
}: RoleEditorProps) => {
  const { t } = useTranslation("common");

  const [editingDetail, setEditingDetail] = useState<Record<string | number, Record<string, any>> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { upsertHashtag } = useHashtags();
  const { upsertProfileHashtag } = useProfileHashtags();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    control,
    formState: { errors },
  } = useForm<Record<string, any>>({
    defaultValues: fields.reduce((acc, field) => ({ ...acc, [field.name]: field.default || "" }), {}),
  });

  useEffect(() => {
    reset(fields.reduce((acc, field) => ({ ...acc, [field.name]: field.default || "" }), {}));
  }, [details, fields, reset]);

  const onSubmit = async (data: Record<string, any>) => {
    try {
      clearErrors("root");
      const isValid = fields.every(field => !field.required || data[field.name]?.trim());
      if (!isValid) {
        setError("root", { message: t("form.validation.allRequired") });
        return;
      }

      await addDetails({
        ...data,
        role_id: role.id,
        profile_id: String(profileId),
      });

      // Extract hashtags from principal fields
      const hashtags: string[] = [];
      for (const field of fields) {
        if (principalFields.has(field.name) && data[field.name]) {
          const values = data[field.name]
            .split(",")
            .map((val: string) => val.trim())
            .filter(Boolean);
          hashtags.push(...values.map((val: string) => `#${val.replace(/\s+/g, "")}`));
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
              profile_id: String(profileId),
              hashtag_id: hashtag.id,
            });
          })
        );
      } catch (error: any) {
        console.error("Error while upserting profile hashtags:", error.message);
      }

      reset();
      setSuccessMessage(t("messages.success.add", { item: title.toLowerCase() }));
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    } catch (err: any) {
      console.error(t("messages.error.add", { item: title.toLowerCase() }), err);
      setError("root", { message: t("messages.error.add", { item: title.toLowerCase() }) });
    }
  };

  const handleSaveDetail = async (detail: Detail) => {
    // Merge existing edits for this detail
    const updated = {
      ...detail,
      ...(editingDetail?.[detail.id] || {}),
    };

    // Validate required fields
    const isValid = fields.every(field =>
      !field.required || updated[field.name]?.toString().trim()
    );

    if (!isValid) {
      setError("root", { message: t("form.validation.allRequired") });
      return;
    }

    try {
      // Update the detail in backend
      await updateDetails(detail.id, { ...detail, ...updated });

      // Extract hashtags from principalFields
      const hashtags: string[] = [];
      for (const field of fields) {
        if (principalFields.has(field.name) && updated[field.name]) {
          const values = updated[field.name]
            .split(",")
            .map((val: string) => val.trim())
            .filter(Boolean);
          hashtags.push(...values.map((val: string) => `#${val.replace(/\s+/g, "")}`));
        }
      }

      // Upsert each hashtag into hashtags table
      const upsertedHashtags = await Promise.all(
        hashtags.map(async (tag) => {
          const hashtag = await upsertHashtag({ name: tag });
          return hashtag;
        })
      );

      // Associate hashtags with profile in profile_hashtags table
      await Promise.all(
        upsertedHashtags.map(async (hashtag) => {
      await upsertProfileHashtag({
        profile_id: String(profileId),
        hashtag_id: hashtag.id,
      });
        })
      );

      // Show success message and cleanup
      setSuccessMessage(t("messages.success.update", { item: title.toLowerCase() }));
      setTimeout(() => setSuccessMessage(""), 3000);

      setEditingDetail((prev) => {
        const { [detail.id]: _, ...rest } = prev || {};
        return rest;
      });

      // Refetch data after update
      refetch();
    } catch (err: any) {
      console.error(`Error updating ${title.toLowerCase()}:`, err);
      setError("root", { message: t("messages.error.update", { item: title.toLowerCase() }) });
    }
  };

  const handleDeleteDetail = async (id: string | number) => {
    console.log(`Deleting ${title.toLowerCase()} with ID:`, id);

    try {
      await deleteDetails(id);
      setSuccessMessage(t("messages.success.delete", { item: title.toLowerCase() }));
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    } catch (err: any) {
      console.error(`Error deleting ${title.toLowerCase()}:`, err);
      setError("root", { message: t("messages.error.delete", { item: title.toLowerCase() }) });
    }
  };

  return (
    <div className="text-gray-900">
      <h4 className="text-xl text-gray-200 font-semibold mb-4">{title}</h4>

      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}
      {errors.root && <p className="text-red-500 mb-2">{(errors.root as any).message}</p>}

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
                      <option value="">
                        {t("generic.chooseOne")}
                      </option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
                variant="contained"
                className="!text-white !bg-emerald-600 hover:!bg-emerald-700 !px-3 !rounded-xl flex gap-1 !text-sm"
              >
                {t("generic.save")}
              </Button>
              <Button
                onClick={() => handleDeleteDetail(detail.id)}
                color="error"
                variant="contained"
                className="!text-white !px-3 !rounded-xl !text-sm flex gap-1"
              >
                {t("generic.delete")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 bg-gray-900 p-6 rounded-2xl shadow-inner border border-gray-600">
        <h5 className="text-lg font-medium mb-4 text-center text-white">{t("addNew", { item: title.toLowerCase() })}</h5>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.name}>
              {field.type === "select" ? (
                <Controller
                  name={field.name}
                  control={control}
                  rules={{ required: field.required ? `${field.label} is required` : false }}
                  render={({ field: controllerField }: { field: any }) => (
                    <Select
                      id={field.name}
                      label={field.label}
                      options={field.options || []}
                      {...controllerField}
                    />
                  )}
                />
              ) : (
                <Input
                  id={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  type={field.type || "text"}
                  error={errors[field.name]?.message}
                  register={register}
                  validation={{
                    required: field.required ? `${field.label} is required` : false,
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 w-full flex justify-center">
          <Button
            type="submit"
            variant="contained"
            className="!text-white !bg-emerald-600 hover:!bg-emerald-700 !w-1/2 !px-3 !rounded-xl flex gap-1 !text-sm"
          >
            {t("generic.add")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoleEditor;
