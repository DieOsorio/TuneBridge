import { useEffect, useRef } from "react";
import { useProfile } from "../context/profile/ProfileContext";

/**
 * Hook to automatically update user's last seen timestamp:
 * - On component mount
 * - On visibility change (tab focus)
 * - Every 10 minutes (interval)
 *
 * @param enabled - Whether the tracking is enabled
 */
export default function useLastSeen(enabled: boolean): void {
  const { lastSeen } = useProfile();
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 1. On mount
    lastSeen();

    // 2. On visibility change
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        lastSeen();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 3. Every 10 minutes
    timer.current = setInterval(lastSeen, 1000 * 60 * 10);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (timer.current) clearInterval(timer.current);
    };
  }, [lastSeen, enabled]);
}
