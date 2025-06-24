import { useEffect, useState } from "react";
import { FaBolt } from "react-icons/fa";
import { useProfile } from "../../context/profile/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import LoadingBadge from "../ui/LoadingBadge";
import { useTranslation } from "react-i18next";

export default function MatchScoreIndicator({ otherProfile }) {
  const { t } = useTranslation("profile");
  const { user } = useAuth();
  const { matchScore } = useProfile();
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (user?.id && otherProfile?.id) {
      matchScore({
        profileAId: user.id,
        profileBId: otherProfile.id,
      })
        .then((result) => {
          setScore(result);
        })
        .catch((err) => {
          console.error("matchScore error", err);
        });
    }
  }, [user?.id, otherProfile?.id]);

  if (score === null) return <LoadingBadge color="amber"/>

  const percentage = Math.round(score * 100);

  return (
    <div
      className="inline-flex items-center gap-2 cursor-help select-none"
      title={t("matchScore.title")}
    >
      <FaBolt className="text-amber-700 text-xl" />

      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
          percentage >= 70
            ? "bg-amber-800 text-white"
            : percentage >= 40
            ? "bg-sky-700 text-white"
            : percentage >= 10 
            ? "bg-gray-300 text-gray-900"
            : "bg-gray-800 text-gray-100"
        }`}
      >
        Match: {percentage}%
      </span>
    </div>
  );
}
