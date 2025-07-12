import {
  Routes,
  Route,
  useParams,
  Navigate,
}                                 from "react-router-dom";
import { useAuth }                from "../context/AuthContext";
import { useProfileGroups }       from "../context/profile/ProfileGroupsContext";
import { useProfileGroupMembers } from "../context/profile/ProfileGroupMembersContext";

import Loading      from "../utils/Loading";
import ErrorMessage from "../utils/ErrorMessage";
import GroupHeader  from "../components/profiles/group/GroupHeader";

import GroupAbout     from "../components/profiles/group/GroupAbout";
import GroupPosts     from "../components/profiles/group/GroupPosts";
import CalendarScreen from "../components/profiles/group/GroupCalendar";
import GroupForm      from "../components/profiles/group/GroupForm";
import FollowersList  from "../components/profiles/group/FollowersList";

export default function ProfileGroup() {
  const { groupId } = useParams();
  const { user }    = useAuth();

  /** ---------- fetch info ---------- */
  const { fetchProfileGroup } = useProfileGroups();
  const { data: group, isLoading, error } = fetchProfileGroup(groupId);

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

  /** ---------- permissions ---------- */
  const me     = members?.find(m => m.profile_id === user.id);
  const isAdmin   = me?.role === "admin";
  const isMember  = !!me;

  /** ---------- internal views ---------- */
  return (
    <div className="flex flex-col min-h-screen text-white">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* header with navigation buttons */}
        <GroupHeader
          groupData={group}
          isAdmin={isAdmin}
        />

        {/* sub-routes */}
        <Routes>
          <Route index           element={<GroupAbout group={group} members={members} />} />
          <Route path="posts/*"  element={<GroupPosts groupId={groupId} isMember={isMember} />} />
          <Route path="followers" element={<FollowersList groupId={groupId} />} />

          {isAdmin && (
            <>
              <Route path="calendar" element={<CalendarScreen groupId={groupId} />} />
              <Route path="edit"     element={
                <GroupForm
                  group={group}
                  onSave={() => window.history.back()}
                  onCancel={() => window.history.back()}
                />
              } />
            </>
          )}

          {/* fallback → about */}
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>

      </div>
    </div>
  );
}
