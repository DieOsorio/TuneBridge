import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/context/profile/ProfileContext";
import { FiPlus } from "react-icons/fi";

import GroupMembersList from "../GroupMembersList";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Loading from "@/utils/Loading";

import type { ProfileGroupMember as GroupMember } from "@/context/profile/profileGroupMembersActions";

interface MembersSettingsProps {
  groupId: string;
  groupMembers: GroupMember[];
  isAdmin: boolean;
  addGroupMember: (data: {
    profile_group_id: string;
    profile_id: string;
    role: string;
    roles_in_group: string[];
  }) => Promise<GroupMember>;
  removeGroupMember: (data: { 
    profileGroupId: string; 
    profileId: string 
  }) => Promise<void>;
  updateGroupMember: (data: { 
    member: GroupMember; 
    updates: Partial<GroupMember> 
  }) => Promise<GroupMember>;
  refetch: () => void;
}

interface FormValues {
  newMemberUsername: string;
  newMemberRole: string;
  newBandRole: string;
}

const MembersSettings = ({
  groupId,
  groupMembers,
  isAdmin,
  addGroupMember,
  removeGroupMember,
  updateGroupMember,
  refetch,
}: MembersSettingsProps) => {
  const { t } = useTranslation("profileGroup");
  const [showAddMember, setShowAddMember] = useState(false);
  const [usernameToSearch, setUsernameToSearch] = useState("");
  const [notFoundError, setNotFoundError] = useState("");
  const [customRoles, setCustomRoles] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const { fetchProfile } = useProfile();
  const { data: userProfile, isLoading, error } = fetchProfile(usernameToSearch);

  const handleAddMember: SubmitHandler<FormValues> = async (data) => {
    setNotFoundError("");
    setUsernameToSearch(data.newMemberUsername);
  };

  const value = watch("newBandRole")?.trim();

  useEffect(() => {
    if (!usernameToSearch) return;
    if (isLoading) return;

    if (error) {
      setNotFoundError(t("groupMembers.errors.notFound"));
      return;
    }

    if (userProfile) {
      (async () => {
        await addGroupMember({
          profile_group_id: groupId,
          profile_id: userProfile.id,
          role: watch("newMemberRole"),
          roles_in_group: customRoles,
        });
        setShowAddMember(false);
        reset();
        setUsernameToSearch("");
      })();
    } else {
      setNotFoundError(t("groupMembers.errors.notFound"));
    }
  }, [
    userProfile,
    isLoading,
    error,
    usernameToSearch,
    addGroupMember,
    groupId,
    reset,
    t,
    watch,
    setShowAddMember,
    customRoles,
  ]);

  const handleUpdateMember = async (member: GroupMember, updates: Partial<GroupMember>) => {
    await updateGroupMember({
      member,
      updates,
    });
  };

  const handleRemoveMember = async (profileId: string) => {
    await removeGroupMember({ profileGroupId: groupId, profileId });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 shadow-md rounded-lg p-6 flex flex-col gap-8 w-full min-w-0 sm:min-w-[320px] sm:w-auto">
      <h2 className="text-2xl font-semibold text-center text-yellow-600">
        {t("groupMembers.title")}
      </h2>
      {isAdmin && (
        <div className="mb-4">
          {showAddMember ? (
            <form
              id="add-member-form"
              onSubmit={handleSubmit(handleAddMember)}
              className="flex flex-col gap-2 mt-2"
            >
              <Input
                id="newMemberUsername"
                label={t("groupMembers.labels.username")}
                maxLength={12}
                placeholder={t("groupMembers.placeholders.username")}
                register={register}
                validation={{ required: t("groupMembers.validations.username") }}
                error={errors.newMemberUsername || notFoundError}
                classForLabel="text-gray-200"
              />
              <Select
                id="newMemberRole"
                label={t("groupMembers.labels.role")}
                options={[
                  { value: "member", label: t("groupMembers.labels.member") },
                  { value: "admin", label: t("groupMembers.labels.admin") },
                  { value: "musician", label: t("groupMembers.labels.musician") },
                  { value: "manager", label: t("groupMembers.labels.manager") },
                ]}
                register={register}
                error={errors.newMemberRole}
                classForLabel="text-gray-200"
              />
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Input
                    id="newBandRole"
                    label={t("groupMembers.labels.bandRole")}
                    maxLength={12}
                    placeholder={t("groupMembers.placeholders.bandRole")}
                    register={register}
                    error={errors.newBandRole}
                    className="!flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        value &&
                        !customRoles.includes(value) &&
                        customRoles.length < 3
                      ) {
                        setCustomRoles([...customRoles, value]);
                        setValue("newBandRole", "");
                      }
                    }}
                    disabled={!value || customRoles.length >= 3}
                    className="text-emerald-500 hover:text-emerald-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FiPlus size={22} />
                  </button>
                </div>
                {errors.newBandRole && (
                  <span className="text-red-500 text-sm">{errors.newBandRole.message}</span>
                )}

                {customRoles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {customRoles.map((role, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-sm rounded bg-emerald-800 text-white flex items-center gap-2"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() =>
                            setCustomRoles(customRoles.filter((r) => r !== role))
                          }
                          className="text-red-400 hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-center mb-5">
                <Button
                  onClick={() => setShowAddMember(false)}
                  className="!bg-gray-600 hover:!bg-gray-700"
                >
                  {t("groupMembers.buttons.cancel")}
                </Button>
                <Button
                  form="add-member-form"
                  type="submit"
                  className="!bg-emerald-600 hover:!bg-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t("groupMembers.buttons.adding")
                    : t("groupMembers.buttons.add")}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mb-4 flex items-center gap-2">
              <div className="relative group flex items-center">
                <button
                  type="button"
                  onClick={() => setShowAddMember(true)}
                  className="text-emerald-600 hover:text-emerald-700 cursor-pointer p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                >
                  <FiPlus size={28} />
                </button>
                <span
                  className="absolute left-10 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 bg-gray-900 text-emerald-500 font-semibold text-base px-3 py-1 rounded-lg shadow pointer-events-none"
                  style={{ willChange: "opacity, transform" }}
                >
                  {t("groupMembers.buttons.addMember")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      <GroupMembersList
        members={groupMembers}
        isAdmin={isAdmin}
        onRemoveMember={handleRemoveMember}
        onUpdateMember={handleUpdateMember}
        refetch={refetch}
      />
    </div>
  );
};

export default MembersSettings;
