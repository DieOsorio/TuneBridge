import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Select, { Option } from "@/components/ui/Select";

import type { BannedUser } from "@/context/admin/bannedUsersActions";

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

  useEffect(() => {
    if (initialData) {
      setValue("profile_id", initialData.profile_id);
      setValue("reason", initialData.reason);
      setValue(
        "banned_until",
        initialData.banned_until ? initialData.banned_until.substring(0, 16) : ""
      );
      setValue("type", initialData.type);
    } else if (profileId) {
      setValue("profile_id", profileId);
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
        {profileId ? "Edit Ban" : "Add Ban"}
      </h2>

      <Input
        id="profile_id"
        label="Profile ID"
        placeholder="UUID of the user"
        register={register}
        validation={{ required: "Profile ID is required" }}
        error={errors.profile_id}        
        disabled={!!profileId}
      />

      <Textarea
        id="reason"
        label="Reason"
        placeholder="Reason for the ban"
        register={register}
        validation={{ required: "Reason is required" }}
        error={errors.reason}        
      />

      <Input
        id="banned_until"
        label="Banned Until (optional)"
        type="datetime-local"
        register={register}
        error={errors.banned_until}        
      />

      <Select
        id="type"
        label="Ban Type"
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
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default BanForm;
