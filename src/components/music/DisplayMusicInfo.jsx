import React, { useEffect } from "react";
import { useMusic } from "../../context/music/MusicContext";

const DisplayMusicInfo = ({ profileId }) => {
  console.log("DisplayMusicInfo rendered with profileId:", profileId);

  const { roles, loading, error, fetchRolesForProfile } = useMusic();

  useEffect(() => {
    if (profileId) {
      console.log("Fetching roles for profileId:", profileId);
      fetchRolesForProfile(profileId);
    }
  }, [profileId]);

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <p className="text-gray-500">Loading music information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg shadow-md">
        <p className="text-red-500">Error loading music information: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4">Music Roles</h3>
      {roles.length === 0 ? (
        <p className="text-gray-500">No music-related roles found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-gray-100 p-4 rounded-lg shadow-sm flex items-center justify-center text-lg font-medium text-gray-700"
            >
              {role.role}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayMusicInfo;