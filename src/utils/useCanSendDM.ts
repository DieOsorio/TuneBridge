import { useAuth } from "../context/AuthContext";
import { useUserConnections } from "../context/social/UserConnectionsContext";
import { useSettings } from "../context/settings/SettingsContext";

type AllowMessagesSetting = "all" | "connections_only" | "none";
type DMReason = "ok" | "not-connected" | "blocked";

interface PrivacyPrefs {
  allow_messages: AllowMessagesSetting;
}

interface Connection {
  status: "pending" | "accepted" | "rejected" | string;
  [key: string]: any;
}

interface UseCanSendDMResult {
  canSend: boolean;
  loading: boolean;
  reason: DMReason;
}

export function useCanSendDM(targetProfileId: string): UseCanSendDMResult {
  const { user } = useAuth();
  const { privacyOthers } = useSettings();
  const { data: prefs, isLoading: loadingPrefs } = privacyOthers(
    targetProfileId
  ) as { data: PrivacyPrefs | undefined; isLoading: boolean };

  if (!user?.id) {
    return { canSend: false, loading: false, reason: "blocked" };
  }

  const { connectionBetweenProfiles } = useUserConnections();
  const {
    data: connection,
    isLoading: loadingConn,
  } = connectionBetweenProfiles(user?.id, targetProfileId) as { data: Connection | undefined; isLoading: boolean };

  const loading = loadingPrefs || loadingConn;

  let canSend = false;
  let reason: DMReason = "blocked";

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
