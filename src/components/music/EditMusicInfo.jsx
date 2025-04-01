import React, { useState, useEffect } from "react";
import { useMusic } from "../../context/music/MusicContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Loading from "../../utilis/Loading";

const predefinedRoles = ["Composer", "DJ", "Instrumentalist", "Producer", "Singer", "Other"]; // Predefined options

const EditMusicInfo = ({ profileId }) => {
  const { roles, loading, error, fetchRolesForProfile, addRoleForProfile, deleteRoleForProfile } = useMusic();
  const [selectedRole, setSelectedRole] = useState(""); // For dropdown selection
  const [customRole, setCustomRole] = useState(""); // For custom role input
  const [errorMessage, setErrorMessage] = useState(""); // For displaying errors

  useEffect(() => {
    if (profileId) {
      fetchRolesForProfile(profileId);
    }
  }, [profileId]);

  const handleAddRole = async () => {
    if (roles.length >= 8) {
      setErrorMessage("You can only have a maximum of 8 roles.");
      return;
    }

    const roleToAdd = selectedRole === "Other" ? customRole.trim() : selectedRole;
    if (!roleToAdd) return; // Prevent adding empty roles

    await addRoleForProfile(profileId, roleToAdd);
    setSelectedRole(""); // Reset dropdown
    setCustomRole(""); // Reset custom input
    setErrorMessage(""); // Clear any previous error messages
  };

  const handleDeleteRole = async (roleId) => {
    await deleteRoleForProfile(roleId);
    setErrorMessage(""); // Clear any previous error messages
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Music Information</h2>

      {/* Dropdown and Custom Input */}
      <div className="mb-4">
        <label htmlFor="roleSelector" className="block text-lg font-medium mb-2">
          Select a Role
        </label>
        <select
          id="roleSelector"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
          disabled={roles.length >= 8} // Disable dropdown if max roles reached
        >
          <option value="" disabled>
            Choose a role
          </option>
          {predefinedRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        {/* Show custom input if "Other" is selected */}
        {selectedRole === "Other" && (
          <Input
            label="Custom Role"
            placeholder="Enter custom role"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            disabled={roles.length >= 8} // Disable input if max roles reached
          />
        )}

        <Button
          onClick={handleAddRole}
          className="mt-2"
          disabled={roles.length >= 8} // Disable button if max roles reached
        >
          Add Role
        </Button>

        {/* Error Message */}
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      </div>

      {/* Display Existing Roles */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Your Roles</h3>
        {roles.length === 0 ? (
          <p>No roles available. Add a new role to get started.</p>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm"
              >
                <span className="text-lg">{role.role}</span>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditMusicInfo;