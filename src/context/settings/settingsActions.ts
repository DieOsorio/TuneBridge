import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";                
import {
  optimisticUpdate,
  invalidateKeys,
  rollbackCache,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";                         
import { 
  uiPrefKeyFactory,
  privacyKeyFactory,
  notifPrefKeyFactory 
 } from "../helpers/settings/keys";

// --- Interfaces ---
export interface UiPreferences {
  profile_id: string;
  lang: string;
  theme: string;
  time_format?: string;
}

export interface PrivacyPrefs {
  prefs: {
    show_email: boolean;
    allow_messages: "all" | "connections_only" | "none";
    show_last_seen: boolean;
    searchable_profile: boolean;
  }
}

export interface PrivacySettings {
  profile_id: string;
  prefs: PrivacyPrefs;
}

export interface NotificationPrefs {
  profile_id: string;
  likes: boolean;
  comments: boolean;
  connections: boolean;
  groups: boolean;
  matches: boolean;
}

/* ------------------------------------------------------------------
 * SELECT  – get UI preferences 
 * -----------------------------------------------------------------*/
export const useUiPreferencesQuery = (profileId?: string): UseQueryResult<UiPreferences, Error> => {
  const queryKey = profileId ? uiPrefKeyFactory({ profileId }).single : undefined;

  return useQuery<UiPreferences, Error>({
    queryKey: queryKey!,
    enabled: !!profileId,
    queryFn: async () => {
      if (!profileId) throw new Error("No profileId provided");

      const { data, error } = await supabase
        .schema("users")
        .from("ui_preferences")
        .select("*")
        .eq("profile_id", profileId)
        .single();

      if (error && error.code !== "PGRST116") throw new Error(error.message);
      return data ?? { profile_id: profileId, lang: "en", theme: "dark" };
    },
    retry: false,
  });
};


/* ------------------------------------------------------------------
 * UPSERT – create or update (lang, theme, …)
 * -----------------------------------------------------------------*/
export const useUpsertUiPreferences = (): UseMutationResult<UiPreferences, Error, UiPreferences> => {
  const queryClient = useQueryClient();
  return useMutation<UiPreferences, Error, UiPreferences>({
    mutationFn: async ({ profile_id, lang, theme }: UiPreferences) => {
      const { data, error } = await supabase
        .schema("users")
        .from("ui_preferences")
        .upsert({ profile_id, lang, theme })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return data as UiPreferences;
    },
    onMutate: async (newPrefs: UiPreferences) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: (entity: UiPreferences) => uiPrefKeyFactory({ profileId: entity.profile_id }).single,
        entity: newPrefs,
        type: "update",
        idKey: "profile_id",
      });
    },
    onError: (_err, _vars, context) => {
      rollbackCache({ queryClient, previousData: context as Record<string, unknown> });
    },
    onSuccess: (savedPrefs, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: UiPreferences) => uiPrefKeyFactory({ profileId: entity.profile_id }).single,
        entity: { profile_id: variables.profile_id, lang: savedPrefs.lang, theme: savedPrefs.theme },
        newEntity: savedPrefs,
        idKey: "profile_id",
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: (entity: UiPreferences) => uiPrefKeyFactory({ profileId: entity.profile_id }).single,
        entity: { profile_id: variables.profile_id, lang: "", theme: "" },
      });
    },
  });
};


// PRIVACY SETTINGS

/* ------------------------------------------------------------------
 * SELECT – get privacy preferences
 * -----------------------------------------------------------------*/
export const usePrivacySettingsQuery = (
  profileId?: string
): UseQueryResult<PrivacyPrefs["prefs"], Error> => {
  const queryKey = profileId ? privacyKeyFactory({ profileId }).single : undefined;

  return useQuery<PrivacyPrefs["prefs"], Error>({
    queryKey: queryKey!,
    enabled : !!profileId,
    queryFn : async () => {
      if (!profileId) throw new Error("No profileId provided");

      const { data, error } = await supabase
        .schema("users")
        .from("privacy_settings")
        .select("prefs")
        .eq("profile_id", profileId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw new Error(error.message);

      return (
        data?.prefs ?? {
          show_email: false,
          allow_messages: "all",
          show_last_seen: true,
          searchable_profile: true,
        }
      );
    },
    retry: false,
  });
};


/* ------------------------------------------------------------------
 * UPSERT – create or update preferences
 * -----------------------------------------------------------------*/
export const useUpsertPrivacySettings = (): UseMutationResult<PrivacySettings, Error, PrivacySettings> => {
  const queryClient = useQueryClient();
  return useMutation<PrivacySettings, Error, PrivacySettings>({
    mutationFn: async ({ profile_id, prefs }: PrivacySettings) => {
      const { error } = await supabase
        .schema("users")
        .from("privacy_settings")
        .upsert({ profile_id, prefs });
      if (error) throw new Error(error.message);
      return { profile_id, prefs };
    },
    onMutate: async (newRow: PrivacySettings) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: (entity: PrivacySettings) => privacyKeyFactory({ profileId: entity.profile_id }).single,
        entity: newRow,
        type: "update",
        idKey: "profile_id",
      });
    },
    onError: (_err, _vars, ctx) => rollbackCache({ queryClient, previousData: ctx as Record<string, unknown> }),
    onSuccess: (saved, vars) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: PrivacySettings) => privacyKeyFactory({ profileId: entity.profile_id }).single,
        entity: { profile_id: vars.profile_id, prefs: saved.prefs },
        newEntity: saved,
        idKey: "profile_id",
      }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: PrivacySettings) => privacyKeyFactory({ profileId: entity.profile_id }).single,
        entity: vars,
      }),
  });
};


// NOTIFICATIONS SETTINGS

/* ------------------------------------------------------------------
 * SELECT – obtain notification prefs for a profile
 * -----------------------------------------------------------------*/
export const useNotificationPrefsQuery = (
  profileId?: string
): UseQueryResult<NotificationPrefs, Error> => {
  const queryKey = profileId ? notifPrefKeyFactory({ profileId }).single : undefined;

  return useQuery<NotificationPrefs, Error>({
    queryKey: queryKey!,
    enabled : !!profileId,
    queryFn : async () => {
      if (!profileId) throw new Error("No profileId provided");

      const { data, error, status } = await supabase
        .schema("social")
        .from("notification_prefs")
        .select("*")
        .eq("profile_id", profileId)
        .maybeSingle();

      if (error && status !== 406) throw new Error(error.message);

      return (
        data ?? {
          profile_id : profileId,
          likes: true,
          comments: true,
          connections: true,
          groups: true,
          matches: true,
        }
      );
    },
    retry: false,
  });
};


/* ------------------------------------------------------------------
 * UPSERT – create / update prefs
 * -----------------------------------------------------------------*/
export const useUpsertNotificationPrefs = (): UseMutationResult<NotificationPrefs, Error, NotificationPrefs> => {
  const queryClient = useQueryClient();
  return useMutation<NotificationPrefs, Error, NotificationPrefs>({
    mutationFn: async (prefsObj: NotificationPrefs) => {
      const { error } = await supabase
        .schema("social")
        .from("notification_prefs")
        .upsert(prefsObj);
      if (error) throw new Error(error.message);
      return prefsObj;
    },
    onMutate: async (newPrefs: NotificationPrefs) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: NotificationPrefs) => notifPrefKeyFactory({ profileId: entity.profile_id }).single,
        entity: newPrefs,
        type: "update",
        idKey: "profile_id",
      }),
    onError: (_err, _vars, ctx) =>
      rollbackCache({ queryClient, previousData: ctx as Record<string, unknown> }),
    onSuccess: (savedPrefs, variables) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: NotificationPrefs) => notifPrefKeyFactory({ profileId: entity.profile_id }).single,
        entity: { profile_id: variables.profile_id, likes: savedPrefs.likes, comments: savedPrefs.comments, connections: savedPrefs.connections, groups: savedPrefs.groups, matches: savedPrefs.matches },
        newEntity: savedPrefs,
        idKey: "profile_id",
      }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: NotificationPrefs) => notifPrefKeyFactory({ profileId: entity.profile_id }).single,
        entity: vars,
      }),
  });
};