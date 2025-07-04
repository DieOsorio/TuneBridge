import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

 // UI SETTINGS

/* ------------------------------------------------------------------
 * SELECT  – get UI preferences 
 * -----------------------------------------------------------------*/
export const useUiPreferencesQuery = (profileId) => {
  return useQuery({
    queryKey: uiPrefKeyFactory({ profileId }).single,
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("ui_preferences")
        .select("*")
        .eq("profile_id", profileId)
        .single();                   // null si no existe aún
      if (error && error.code !== "PGRST116") throw new Error(error.message);
      return data ?? { profile_id: profileId, lang: "en", theme: "dark" };
    },
    retry: false,
  });
};

/* ------------------------------------------------------------------
 * UPSERT – create or update (lang, theme, …)
 * -----------------------------------------------------------------*/
export const useUpsertUiPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profile_id, lang, theme }) => {
      const { data, error } = await supabase
        .schema("users")
        .from("ui_preferences")
        .upsert({ profile_id, lang, theme })
        .select("*")
        .single();
        
      if (error) throw new Error(error.message);
      return data ;
    },

    /* ---------- Optimistic cache ---------- */
    onMutate: async (newPrefs) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: uiPrefKeyFactory,
        entity: newPrefs,
        type: "update",
        idKey: "profile_id",
      });
    },

    onError: (_err, _vars, context) => {
      rollbackCache({ queryClient, previousData: context });
    },

    onSuccess: (savedPrefs, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: uiPrefKeyFactory,
        entity: { profile_id: variables.profile_id },
        newEntity: savedPrefs,
        idKey: "profile_id",
      });
    },

    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: uiPrefKeyFactory,
        entity: { profile_id: variables.profile_id },
      });
    },
  });
};


// PRIVACY SETTINGS

/* ------------------------------------------------------------------
 * SELECT – get privacy preferences
 * -----------------------------------------------------------------*/
export const usePrivacySettingsQuery = (profileId) =>
  useQuery({
    queryKey: privacyKeyFactory({ profileId }).single,
    enabled : !!profileId,
    queryFn : async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("privacy_settings")
        .select("prefs")
        .eq("profile_id", profileId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw new Error(error.message);

      /* default value */
      return (
        data?.prefs ?? {
          show_email        : false,
          allow_messages    : "all",      // all | connections_only | none
          show_last_seen    : true,
          searchable_profile: true,
        }
      );
    },
    retry: false,
  });

/* ------------------------------------------------------------------
 * UPSERT – create or update preferences
 * -----------------------------------------------------------------*/
export const useUpsertPrivacySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profile_id, prefs }) => {
      const { error } = await supabase
        .schema("users")
        .from("privacy_settings")
        .upsert({ profile_id, prefs });
      if (error) throw new Error(error.message);
      return { profile_id, prefs };
    },

    /* ---------- Optimistic cache ---------- */
    onMutate: async (newRow) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: privacyKeyFactory,
        entity    : newRow,
        type      : "update",
        idKey     : "profile_id",
      });
    },

    onError: (_err, _vars, ctx) => rollbackCache({ queryClient, previousData: ctx }),

    onSuccess: (saved, vars) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: privacyKeyFactory,
        entity    : { profile_id: vars.profile_id },
        newEntity : saved,
        idKey     : "profile_id",
      }),

    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: privacyKeyFactory,
        entity    : { profile_id: vars.profile_id },
      }),
  });
};


// NOTIFICATIONS SETTINGS

/* ------------------------------------------------------------------
 * SELECT – obtain notification prefs for a profile
 * -----------------------------------------------------------------*/
export const useNotificationPrefsQuery = (profileId) =>
  useQuery({
    queryKey: notifPrefKeyFactory({ profileId }).single,
    enabled : !!profileId,
    queryFn : async () => {
      const { data, error, status } = await supabase
        .schema("social")
        .from("notification_prefs")
        .select("*")
        .eq("profile_id", profileId)
        .maybeSingle();               // null → row doesn’t exist yet

      if (error && status !== 406) throw new Error(error.message);

      // Default prefs when row still not created
      return (
        data ?? {
          profile_id : profileId,
          likes      : true,
          comments   : true,
          connections: true,
          groups     : true,
          matches    : true,
        }
      );
    },
    retry: false,
  });

/* ------------------------------------------------------------------
 * UPSERT – create / update prefs
 * -----------------------------------------------------------------*/
export const useUpsertNotificationPrefs = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (prefsObj) => {
      const { error } = await supabase
        .schema("social")
        .from("notification_prefs")
        .upsert(prefsObj);
      if (error) throw new Error(error.message);
      return prefsObj;
    },

    /* ----- optimistic cache ------ */
    onMutate: async (newPrefs) =>
      optimisticUpdate({
        queryClient: qc,
        keyFactory : notifPrefKeyFactory,
        entity     : newPrefs,
        type       : "update",
        idKey      : "profile_id",
      }),

    onError: (_err, _vars, ctx) =>
      rollbackCache({ queryClient: qc, previousData: ctx }),

    onSuccess: (savedPrefs, variables) =>
      replaceOptimisticItem({
        queryClient: qc,
        keyFactory : notifPrefKeyFactory,
        entity     : { profile_id: variables.profile_id },
        newEntity  : savedPrefs,
        idKey      : "profile_id",
      }),

    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient: qc,
        keyFactory : notifPrefKeyFactory,
        entity     : { profile_id: vars.profile_id },
      }),
  });
};