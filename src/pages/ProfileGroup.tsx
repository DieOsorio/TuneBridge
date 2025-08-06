import {
  Routes,
  Route,
  useParams,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProfileGroups } from "@/context/profile/ProfileGroupsContext";
import { useProfileGroupMembers } from "@/context/profile/ProfileGroupMembersContext";


import Loading from "@/utils/Loading";
import ErrorMessage from "@/utils/ErrorMessage";
import GroupHeader from "@/components/profiles/group/GroupHeader";
import GroupAbout from "@/components/profiles/group/GroupAbout";
import GroupPosts from "@/components/profiles/group/GroupPosts";
import GroupCalendarScreen from "@/components/profiles/group/group-events/GroupCalendarScreen";
import GroupForm from "@/components/profiles/group/GroupForm";
import FollowersList from "@/components/profiles/group/FollowersList";

import type { ProfileGroup } from "@/context/profile/profileGroupsActions"
import type { ProfileGroupMember } from "@/context/profile/profileGroupMembersActions";

export default function ProfileGroup() {
  const groupId = useParams<{ groupId: string }>().groupId!;
  const { user } = useAuth();

  const { fetchProfileGroup } = useProfileGroups();
  const { data: group, isLoading, error } = fetchProfileGroup(groupId ?? "");

  const { fetchGroupMembers } = useProfileGroupMembers();
  const {
    data: members,
    isLoading: mLoading,
    error: mError,
  } = fetchGroupMembers(groupId);

  const loading = isLoading || mLoading || !Array.isArray(members);

  if (loading) return <Loading />;
  if (error || mError) return <ErrorMessage error={error?.message || mError?.message} />;
  if (!group) return <Navigate to="/" replace />;

  const me = user && members?.find((m: ProfileGroupMember) => m.profile_id === user.id);
  const isAdmin = me?.role === "admin";
  const CanManageGroup = isAdmin || me?.role === "manager";
  const isMember = !!me;

  return (
    <div className="flex flex-col min-h-screen text-white">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        <GroupHeader
          groupData={group}
          CanManageGroup={CanManageGroup}
          isMember={isMember}
        />

        <Routes>
          <Route index element={<GroupAbout group={group} members={members} />} />
          <Route path="posts/*" element={<GroupPosts groupId={groupId!} CanManageGroup={CanManageGroup} />} />
          <Route path="followers" element={<FollowersList groupId={groupId!} />} />

          {isMember && (
            <Route
              path="calendar"
              element={
                <GroupCalendarScreen
                  groupId={groupId!}
                  isAdminOrManager={CanManageGroup}
                  isMember={isMember}
                />
              }
            />
          )}

          {isAdmin && (
            <Route
              path="edit"
              element={
                <GroupForm
                  group={group}
                  onSave={() => window.history.back()}
                  onCancel={() => window.history.back()}
                />
              }
            />
          )}

          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>

      </div>
    </div>
  );
}
