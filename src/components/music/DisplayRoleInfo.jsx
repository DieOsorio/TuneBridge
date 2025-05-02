const DisplayRoleInfo = ({ role, data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-300 mt-2">No information available for this role.</p>;
  }

  return (
    <div className="mt-4 w-full">
      <h4 className="text-lg font-semibold mb-2">{role.role} Details</h4>
      <ul className="space-y-2">
        {data.map((item) => (
          <li
            key={item.id}
            className="bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-500"
          >
            {role.role === "Instrumentalist" && (
              <>
                <p>
                  <strong>Instrument:</strong> {item.instrument || "N/A"}
                </p>
                <p>
                  <strong>Years of Experience:</strong> {item.years_of_experience || "N/A"}
                </p>
                <p>
                  <strong>Level:</strong> {item.level || "N/A"}
                </p>
              </>
            )}
            {role.role === "Singer" && (
              <>
                <p>
                  <strong>Voice Type:</strong> {item.voice_type || "N/A"}
                </p>
                <p>
                  <strong>Music Genre:</strong> {item.music_genre || "N/A"}
                </p>
                <p>
                  <strong>Level:</strong> {item.level || "N/A"}
                </p>
              </>
            )}
            {role.role === "DJ" && (
              <>
                <p>
                  <strong>Events Played:</strong> {item.events_played || "N/A"}
                </p>
                <p>
                  <strong>Preferred Genres:</strong> {item.preferred_genres || "N/A"}
                </p>
                <p>
                  <strong>Level:</strong> {item.level || "N/A"}
                </p>
              </>
            )}
            {role.role === "Producer" && (
              <>
                <p>
                  <strong>Production Type:</strong> {item.production_type || "N/A"}
                </p>
                <p>
                  <strong>Years of Experience:</strong> {item.years_of_experience || "N/A"}
                </p>
                <p>
                  <strong>Level:</strong> {item.level || "N/A"}
                </p>
              </>
            )}
            {role.role === "Composer" && (
              <>
                <p>
                  <strong>Composition Style:</strong> {item.composition_style || "N/A"}
                </p>
                <p>
                  <strong>Years of Experience:</strong> {item.years_of_experience || "N/A"}
                </p>
                <p>
                  <strong>Level:</strong> {item.level || "N/A"}
                </p>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DisplayRoleInfo;