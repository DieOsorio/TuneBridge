import { useEffect, useRef } from "react";
import { useProfile } from "../context/profile/ProfileContext";

export default function useLastSeen(enabled) {
  const { lastSeen } = useProfile();
  const timer = useRef(null); 
  
  useEffect(() => {
    if (!enabled) return; // Exit early if last seen tracking is disabled
    // 1. on mount
    lastSeen();

    // 2. on visibility change
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") lastSeen();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 3. every 10 minutes
    timer.current = setInterval(lastSeen, 1000 * 60 * 10);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (timer.current) clearInterval(timer.current);
    };
  }, [lastSeen, enabled]);
}
