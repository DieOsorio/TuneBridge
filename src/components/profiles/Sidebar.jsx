import React, { useState } from "react";
import { FaUserEdit, FaMusic, FaBars } from "react-icons/fa"; // Icons for options

const Sidebar = ({ onSelectOption, avatarUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);

  const options = [
    {
      id: null,
      label: "View Profile",
      icon: (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-5 h-5 rounded-full object-cover" // Ensure consistent size and alignment
        />
      ),
    },
    { id: "editProfile", label: "Edit Profile", icon: <FaUserEdit /> },
    { id: "editMusicInfo", label: "Edit Music Info", icon: <FaMusic /> },
    // Add more options here as needed
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-[calc(100%-64px)] bg-gray-800 text-white transition-all duration-300 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      style={{ top: "80px" }} // Adjust top to match navbar height
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-center h-16">
        <FaBars className="text-2xl" />
      </div>
      <ul className="mt-4">
        {options.map((option) => (
          <li
            key={option.id}
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-700"
            onClick={() => onSelectOption(option.id)}
          >
            <span className="text-xl flex-shrink-0">{option.icon}</span>
            {isExpanded && <span>{option.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;