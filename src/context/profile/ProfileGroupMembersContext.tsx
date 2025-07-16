import { createContext, useContext, ReactNode } from "react";
import {
  useFetchGroupMembersQuery,
  useFetchUserGroupsQuery,
  useAddGroupMemberMutation,
  useRemoveGroupMemberMutation,
  useUpdateGroupMemberMutation,
  useHowManyMembersQuery,
  useUserGroupRole,
  ProfileGroupMember,
  UserGroup,
} from "./profileGroupMembersActions";

interface ProfileGroupMembersContextType {
  fetchUserGroups: typeof useFetchUserGroupsQuery;
  fetchGroupMembers: typeof useFetchGroupMembersQuery;
  addGroupMember: ReturnType<typeof useAddGroupMemberMutation>["mutateAsync"];
  updateGroupMember: ReturnType<typeof useUpdateGroupMemberMutation>["mutateAsync"];
  removeGroupMember: ReturnType<typeof useRemoveGroupMemberMutation>["mutateAsync"];
  howManyMembers: typeof useHowManyMembersQuery;
  userGroupRole: typeof useUserGroupRole;
}

const ProfileGroupMembersContext = createContext<ProfileGroupMembersContextType | null>(null);
ProfileGroupMembersContext.displayName = "ProfileGroupMembersContext";

interface ProfileGroupMembersProviderProps {
  children: ReactNode;
}

export const ProfileGroupMembersProvider = ({ children }: ProfileGroupMembersProviderProps) => {
  const addGroupMember = useAddGroupMemberMutation().mutateAsync;
  const updateGroupMember = useUpdateGroupMemberMutation().mutateAsync;
  const removeGroupMember = useRemoveGroupMemberMutation().mutateAsync;

  const value: ProfileGroupMembersContextType = {
    fetchUserGroups: useFetchUserGroupsQuery,
    fetchGroupMembers: useFetchGroupMembersQuery,
    addGroupMember,
    updateGroupMember,
    removeGroupMember,
    howManyMembers: useHowManyMembersQuery,
    userGroupRole: useUserGroupRole,
  };

  return (
    <ProfileGroupMembersContext.Provider value={value}>
      {children}
    </ProfileGroupMembersContext.Provider>
  );
};

export const useProfileGroupMembers = (): ProfileGroupMembersContextType => {
  const context = useContext(ProfileGroupMembersContext);
  if (!context) {
    throw new Error(
      "useProfileGroupMembers must be used within a ProfileGroupMembersProvider"
    );
  }
  return context;
};
