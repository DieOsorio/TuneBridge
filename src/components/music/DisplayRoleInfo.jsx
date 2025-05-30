import { useTranslation } from "react-i18next"

const DisplayRoleInfo = ({ role, data }) => {
  const { t } = useTranslation("music")

  if (!data || data.length === 0) {
    return (
      <p className="text-gray-400 mt-4 italic text-center">
        {t("roles.noData")}
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-xl font-bold mb-4 text-sky-200 text-center">
        {t("roles.detailsTitle", {
          role: t(`roles.${role.role.toLowerCase()}`)
        })}
      </h4>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item) => (
          <li
            key={item.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm"
          >
            {role.role === "Instrumentalist" && (
              <>
                <Detail label={t("fields.instrument")} value={item.instrument} />
                <Detail label={t("fields.yearsOfExperience")} value={item.years_of_experience} />
                <Detail label={t("fields.level")}  value={item.level} />
              </>
            )}
            {role.role === "Singer" && (
              <>
                <Detail label={t("fields.voiceType")} value={item.voice_type} />
                <Detail label={t("fields.musicGenre")} value={item.music_genre} />
                <Detail label={t("fields.level")}  value={item.level} />
              </>
            )}
            {role.role === "DJ" && (
              <>
                <Detail label={t("fields.eventsPlayed")}  value={item.events_played} />
                <Detail label={t("fields.preferredGenres")} value={item.preferred_genres} />
                <Detail label={t("fields.level")}  value={item.level} />
              </>
            )}
            {role.role === "Producer" && (
              <>
                <Detail label={t("fields.productionType")}  value={item.production_type} />
                <Detail label={t("fields.yearsOfExperience")}  value={item.years_of_experience} />
                <Detail label={t("fields.level")}  value={item.level} />
              </>
            )}
            {role.role === "Composer" && (
              <>
                <Detail label={t("fields.compositionStyle")}  value={item.composition_style} />
                <Detail label={t("fields.yearsOfExperience")}  value={item.years_of_experience} />
                <Detail label={t("fields.level")}  value={item.level} />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Reusable small component for consistent field rendering
const Detail = ({ label, value }) => (
  <p className="text-sm text-gray-300 mb-1">
    <span className="font-semibold text-gray-200">{label}:</span>{" "}
    {value || "N/A"}
  </p>
);


export default DisplayRoleInfo;