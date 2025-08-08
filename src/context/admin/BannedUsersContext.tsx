import { createContext, useContext, ReactNode } from "react";
import {
  useBannedUserQuery,
  useAllBannedUsersQuery,
  useUpsertBannedUserMutation,
  useDeleteBannedUserMutation,
} from "./bannedUsersActions";

export interface BannedUsersContextValue {
  bannedUser: typeof useBannedUserQuery;
  allBannedUsers: typeof useAllBannedUsersQuery;
  upsertBannedUser: ReturnType<typeof useUpsertBannedUserMutation>["mutateAsync"];
  deleteBannedUser: ReturnType<typeof useDeleteBannedUserMutation>["mutateAsync"];
}

const BannedUsersContext = createContext<BannedUsersContextValue | undefined>(undefined);
BannedUsersContext.displayName = "BannedUsersContext";

export interface BannedUsersProviderProps {
  children: ReactNode;
}

export const BannedUsersProvider = ({ children }: BannedUsersProviderProps) => {
  const upsertBannedUser = useUpsertBannedUserMutation().mutateAsync;
  const deleteBannedUser = useDeleteBannedUserMutation().mutateAsync;

  const value: BannedUsersContextValue = {
    bannedUser: useBannedUserQuery,
    allBannedUsers: useAllBannedUsersQuery,
    upsertBannedUser,
    deleteBannedUser,
  };

  return <BannedUsersContext.Provider value={value}>{children}</BannedUsersContext.Provider>;
};

export const useBannedUsers = (): BannedUsersContextValue => {
  const context = useContext(BannedUsersContext);
  if (!context) {
    throw new Error("useBannedUsers must be used within a BannedUsersProvider");
  }
  return context;
};
