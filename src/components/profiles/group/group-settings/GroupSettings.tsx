import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfileGroups } from "@/context/profile/ProfileGroupsContext";
import { useAuth } from "@/context/AuthContext";
import { useProfileGroupMembers } from "@/context/profile/ProfileGroupMembersContext";

import SettingsSidebar from "../../SettingsSidebar";
import GroupForm from "../GroupForm";
import MembersSettings from "./MembersSettings";

import Loading from "@/utils/Loading";
import ErrorMessage from "@/utils/ErrorMessage";

import { UserGroupIcon } from "@heroicons/react/24/solid";
import { UserGroupIcon as UserGroupIconOutline } from "@heroicons/react/24/outline";

import type { ProfileGroup } from "@/context/profile/profileGroupsActions";
import type { ProfileGroupMember } from "@/context/profile/profileGroupMembersActions";

interface GroupSettingsParams extends Record<string, string | undefined> {
  groupId?: string;
}

const GroupSettings = () => {
  const { groupId } = useParams<GroupSettingsParams>();
  const { user } = useAuth();
  const { t } = useTranslation("groupSettings");

  // Validate groupId presence
  if (!groupId) return <Navigate to="/" replace />;

  /* ---------- fetch group ---------- */
  const { fetchProfileGroup } = useProfileGroups();
  const {
    data: group,
    isLoading: gLoading,
    error: gError,
    refetch: refetchGroup,
  } = fetchProfileGroup(groupId);

  /* ---------- fetch members ---------- */
  const { fetchGroupMembers, updateGroupMember, removeGroupMember, addGroupMember } =
    useProfileGroupMembers();

  const {
    data: members,
    isLoading: mLoading,
    error: mError,
    refetch: refetchMembers,
  } = fetchGroupMembers(groupId);

  if (gLoading || mLoading) return <Loading />;
  if (gError || mError)
    return <ErrorMessage error={gError?.message || mError?.message} />;
  if (!group) return <Navigate to="/" replace />;

  /* ---------- sidebar options ---------- */
  const basePath = `/group/${groupId}/settings`;
  const options = [
    {
      to: basePath,
      label: t("info"),
      icon: (active: boolean) =>
        active ? (
          <img
            src={group.avatar_url ?? ""}
            alt="Group Avatar"
            className="w-5 h-5 rounded-full object-cover ring-2 ring-yellow-600"
          />
        ) : (
          <img
            src={group.avatar_url ?? ""}
            alt="Group Avatar"
            className="w-5 h-5 rounded-full object-cover"
          />
        ),
    },
    {
      to: `${basePath}/members`,
      label: t("members"),
      icon: (active: boolean) => (active ? <UserGroupIcon className="w-5 h-5" /> : <UserGroupIconOutline className="w-5 h-5" />),
    },
  ];

  /* ---------- permissions ---------- */
  const me = members?.find((m: ProfileGroupMember) => m.profile_id === user!.id);
  const isAdmin = me?.role === "admin";

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <SettingsSidebar avatarUrl={group.avatar_url ?? ""} options={options} />

      <div className="flex-grow p-6 overflow-auto max-w-4xl ml-auto md:!mx-auto">
        <Routes>
          {/* General info (index route) */}
          <Route
            index
            element={
              <GroupForm
                group={group as ProfileGroup}
                /* refresh data after save */
                onSave={refetchGroup}
                onCancel={() => {}}
              />
            }
          />

          {/* Members management */}
          <Route
            path="members"
            element={
              <MembersSettings
                groupId={groupId}
                groupMembers={members ?? []}
                isAdmin={isAdmin}
                refetch={refetchMembers}
                addGroupMember={addGroupMember}
                updateGroupMember={updateGroupMember}
                removeGroupMember={removeGroupMember}
              />
            }
          />

          {/* Fallback → general */}
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default GroupSettings;
