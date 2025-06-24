import { useEffect, useState } from "react";
import { useProfile } from "../context/profile/ProfileContext";
import { useAuth } from "../context/AuthContext";
import Loading from "../utils/Loading";
import MatchCard from "../components/profiles/MatchCard";

export default function DiscoverMatches() {
  const { user } = useAuth();
  const { matchAll } = useProfile();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    matchAll({ profileId: user.id, limit: 9 })
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!matches.length || loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match) => (
        <MatchCard key={match.profile_id} profile={match} loading={loading} />
      ))}
    </div>
  );
}
