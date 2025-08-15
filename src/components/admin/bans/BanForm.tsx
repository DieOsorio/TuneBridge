import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useProfile } from "@/context/profile/ProfileContext";

import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Select, { Option } from "@/components/ui/Select";
import ProfileCardSelectable from "@/components/ui/ProfileCardSelectable";

import type { BannedUser } from "@/context/admin/bannedUsersActions";
import type { Profile } from "@/context/profile/profileActions";
import { useTranslation } from "react-i18next";

interface BanFormProps {
  profileId: string | null;
  onClose: () => void;
  onSubmit: (data: Partial<BannedUser>) => Promise<void>;
  initialData?: BannedUser | null;
  currentAdminId: string;
}

interface FormData {
  profile_id: string;
  reason: string;
  banned_until: string;
  type: string;
}

const banTypeOptions: Option[] = [
  { value: "full", label: "Full" },
  { value: "posting", label: "Posting" },
  { value: "messaging", label: "Messaging" },
];

const BanForm = ({
  profileId,
  onClose,
  onSubmit,
  initialData,
  currentAdminId,
}: BanFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      profile_id: "",
      reason: "",
      banned_until: "",
      type: "full",
    },
  });
  const { t } = useTranslation("admin", {keyPrefix: "bans.form" });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfileData, setSelectedProfileData] = useState<Profile | null>(null);

  const { searchProfiles } = useProfile();
  const { data: searchResults, isLoading } = searchProfiles(searchTerm);

  const selectedProfileId = watch("profile_id");

  // Sync selectedProfileData when profile_id changes
  useEffect(() => {
    if (selectedProfileId) {
      const foundProfile = searchResults?.find(p => p.id === selectedProfileId);
      if (foundProfile) {
        setSelectedProfileData(foundProfile);
      } else if (!selectedProfileData || selectedProfileData.id !== selectedProfileId) {
        // Keep existing selectedProfileData or null if not found
        // Optionally add fetch logic here to get profile by id
      }
    } else {
      setSelectedProfileData(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfileId, searchResults]);

  // Initialize form values and selected profile
  useEffect(() => {
    if (initialData) {
      setValue("profile_id", initialData.profile_id);
      setValue("reason", initialData.reason);
      setValue(
        "banned_until",
        initialData.banned_until ? initialData.banned_until.substring(0, 16) : ""
      );
      setValue("type", initialData.type);
      // Optionally set selectedProfileData if you have profile info for initialData.profile_id
    } else if (profileId) {
      setValue("profile_id", profileId);
      // Optionally fetch and set selectedProfileData here
    }
  }, [initialData, profileId, setValue]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      profile_id: data.profile_id,
      reason: data.reason,
      banned_until: data.banned_until ? new Date(data.banned_until).toISOString() : null,
      type: data.type,
      banned_by: currentAdminId,
    });
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 bg-zinc-800 p-6 rounded-lg shadow max-w-lg mx-auto overflow-y-auto max-h-130"
    >
      <h2 className="text-lg font-semibold text-white text-center mb-2">
        {profileId ? t("title.edit") : t("title.add")}
      </h2>

      {/* Search input */}
      <input
        type="text"
        placeholder={t("search.placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 rounded-md bg-gray-800 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />

      {/* Search results */}
      {isLoading && <p className="text-gray-400 text-center mt-1">{t("search.loading")}</p>}
      {!isLoading && searchTerm && (
        <div className="mt-2 max-h-48 overflow-auto flex flex-col gap-2">
          {searchResults?.map((profile: Partial<Profile>) => (
            <ProfileCardSelectable
              key={profile.id}
              profile={profile}
              isSelected={profile.id === selectedProfileId}
              onSelect={() => {
                setValue("profile_id", profile.id || "");
                setSelectedProfileData(profile as Profile);
                setSearchTerm("");
              }}
              onClear={() => {
                setValue("profile_id", "");
                setSelectedProfileData(null);
              }}
            />
          ))}
          {searchResults?.length === 0 && (
            <p className="text-gray-400 text-center text-sm">{t("search.noResults")}</p>
          )}
        </div>
      )}

      {/* Selected profile card */}
      {selectedProfileData && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded-lg">
          <h3 className="text-white font-semibold mb-1">{t("selected.title")}</h3>
          <ProfileCardSelectable
            profile={selectedProfileData}
            isSelected={true}
            onSelect={() => {}}
            onClear={() => {
              setValue("profile_id", "");
              setSelectedProfileData(null);
            }}
          />
        </div>
      )}

      <Textarea
        id="reason"
        label={t("fields.reason.label")}
        placeholder={t("fields.reason.placeholder")}
        register={register}
        validation={{ required: t("fields.reason.required") }}
        error={errors.reason}
      />

      <Input
        id="banned_until"
        label={t("fields.banned_until.label")}
        type="datetime-local"
        register={register}
        error={errors.banned_until}
      />

      <Select
        id="type"
        label={t("fields.type.label")}
        options={banTypeOptions}
        control={control}
        error={errors.type}
        search={false}
      />

      <div className="flex justify-center gap-4">
        <Button
          type="button"
          onClick={onClose}
          className="!bg-gray-600 hover:!bg-gray-700"
          disabled={isSubmitting}
        >
          {t("buttons.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("buttons.saving") : t("buttons.save")}
        </Button>
      </div>
    </form>
  );
};

export default BanForm;
