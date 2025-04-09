import { useState } from "react";
import { FaChevronRight } from "react-icons/fa"; // Import the icon
import Input from "../ui/Input";
import Button from "../ui/Button";
import RoleDataEditor from "./RoleDataEditor";
import { useRoles } from "../../context/music/RolesContext";
import { fetchRolesQuery } from "../../context/music/rolesActions";

const predefinedRoles = ["Composer", "DJ", "Instrumentalist", "Producer", "Singer", "Other"];

const EditMusicInfo = ({ profileId }) => {
  const {data:roles} = fetchRolesQuery(profileId)
  const { addRole, deleteRole } = useRoles();
  const [selectedRole, setSelectedRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [expandedRole, setExpandedRole] = useState(null);

  const handleAddRole = () => {
    const roleName = selectedRole === "Other" ? customRole.trim() : selectedRole;

    if (roles.length >= 6) {
      setErrorMessage("You can have only 6 roles.");
      return;
    }

    if (!roleName) {
      setErrorMessage("Role cannot be empty.");
      return;
    }

    const isDuplicate = roles.some((role) => role.role.toLowerCase() === roleName.toLowerCase());
    if (isDuplicate) {
      setErrorMessage("This role already exists.");
      return;
    }
    
    addRole({profileId, roleName})
      .then(() => {
        setErrorMessage(""); // Clear any previous error messages
        setSelectedRole(""); // Reset the selected role
        setCustomRole(""); // Reset the custom role input
      })
      .catch((error) => {
        console.error("Error adding role:", error);
        setErrorMessage("An error occurred while adding the role.");
      });
  };

  const handleRoleClick = (roleId) => {
    setExpandedRole((prev) => (prev === roleId ? null : roleId));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Music Information</h2>

      <div className="mb-4">
        <label htmlFor="roleSelector" className="block text-lg font-medium mb-2">
          Select a Role
        </label>
        <select
          id="roleSelector"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
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

        {selectedRole === "Other" && (
          <Input
            label="Custom Role"
            placeholder="Enter custom role"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
          />
        )}

        <Button onClick={() => handleAddRole()} className="mt-2">
          Add Role
        </Button>

        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Your Roles</h3>
        {roles.length === 0 ? (
          <p>No roles available. Add a new role to get started.</p>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="p-4 bg-gray-100 rounded-md shadow-md border border-gray-300"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleRoleClick(role.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">{role.role}</span>
                  </div>
                  <div className="flex items-center">
                    <FaChevronRight
                      className={`w-6 h-6 text-gray-300 transition-transform ${
                        expandedRole === role.id ? "rotate-90" : ""
                      }`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the toggle
                        deleteRole(role.id);
                      }}
                      className="ml-4 cursor-pointer bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {expandedRole === role.id && (
                  <div className="mt-4 p-4 bg-white rounded-md shadow-inner border border-gray-200">
                    <RoleDataEditor role={role} profileId={profileId} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditMusicInfo;