import { useAuth } from "../context/AuthContext";
import { useUserConnections } from "../context/social/UserConnectionsContext";
import { useSettings } from "../context/settings/SettingsContext";

export function useCanSendDM(targetProfileId) {
  const { user } = useAuth();
  const { privacyOthers } = useSettings();
  const { data: prefs, isLoading: loadingPrefs } =
    privacyOthers(targetProfileId);

  const { connectionBetweenProfiles } = useUserConnections();
  const {
    data: connection,
    isLoading: loadingConn,
  } = connectionBetweenProfiles(user?.id, targetProfileId, {
    enabled: prefs?.allow_messages === "connections_only",
  });
  
  const loading = loadingPrefs || loadingConn;

  let canSend = false;
  let reason = "blocked"; // "blocked" | "not-connected" | "ok"

  if (!loading) {
    switch (prefs?.allow_messages) {
      case "all":
        canSend = true;
        reason = "ok";
        break;

      case "connections_only":
        canSend = connection?.status === "accepted";
        reason = canSend ? "ok" : "not-connected";
        break;

      case "none":
      default:
        canSend = false;
        reason = "blocked";
    }
  }
  
  return { canSend, loading, reason };
}
