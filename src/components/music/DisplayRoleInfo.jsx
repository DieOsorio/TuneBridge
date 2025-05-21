const DisplayRoleInfo = ({ role, data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-gray-400 mt-4 italic text-center">
        No information available for this role.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-xl font-bold mb-4 text-sky-200 text-center">
        {role.role} Details
      </h4>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item) => (
          <li
            key={item.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm"
          >
            {role.role === "Instrumentalist" && (
              <>
                <Detail label="Instrument" value={item.instrument} />
                <Detail label="Years of Experience" value={item.years_of_experience} />
                <Detail label="Level" value={item.level} />
              </>
            )}
            {role.role === "Singer" && (
              <>
                <Detail label="Voice Type" value={item.voice_type} />
                <Detail label="Music Genre" value={item.music_genre} />
                <Detail label="Level" value={item.level} />
              </>
            )}
            {role.role === "DJ" && (
              <>
                <Detail label="Events Played" value={item.events_played} />
                <Detail label="Preferred Genres" value={item.preferred_genres} />
                <Detail label="Level" value={item.level} />
              </>
            )}
            {role.role === "Producer" && (
              <>
                <Detail label="Production Type" value={item.production_type} />
                <Detail label="Years of Experience" value={item.years_of_experience} />
                <Detail label="Level" value={item.level} />
              </>
            )}
            {role.role === "Composer" && (
              <>
                <Detail label="Composition Style" value={item.composition_style} />
                <Detail label="Years of Experience" value={item.years_of_experience} />
                <Detail label="Level" value={item.level} />
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