import { createContext, useContext, ReactNode, useEffect } from "react";
import {
  useRealtimeBannedUser,
  useBannedUserQuery,
  useAllBannedUsersQuery,
  useUpsertBannedUserMutation,
  useDeleteBannedUserMutation,
  BannedUser,
} from "./bannedUsersActions";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import { bannedUsersKeyFactory } from "../helpers/admin/keys";

export interface BannedUsersContextValue {
  checkBan: typeof useRealtimeBannedUser;
  bannedUser: BannedUser | null | undefined;
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log("user id:", user?.id);
  const { data: bannedUser } = useBannedUserQuery(user?.id ?? null);

  const upsertBannedUser = useUpsertBannedUserMutation().mutateAsync;
  const deleteBannedUser = useDeleteBannedUserMutation().mutateAsync;

  console.log("ban data", bannedUser);
  

  useEffect(() => {
    if (bannedUser?.type === "full") {
      navigate("/banned");
    }
  }, [bannedUser?.type, navigate]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`realtime-banned`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "admin",
          table: "banned_users",
        },
        (payload) => {
          const newData = payload.new as BannedUser | undefined;

          if (newData?.profile_id === user.id) {
            const key = bannedUsersKeyFactory({ profileId: user.id }).all ?? ["bannedUsers", user.id];
            queryClient.setQueryData(key, newData);
          }
          if (payload.eventType === "DELETE") {
            const key = bannedUsersKeyFactory({ profileId: user.id }).all ?? ["bannedUsers", user.id];
            queryClient.setQueryData(key, null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const value: BannedUsersContextValue = {
    checkBan: useRealtimeBannedUser,
    bannedUser,
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
