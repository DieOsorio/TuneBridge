import React, { useState, useEffect, useRef } from "react";
import { FaUserEdit, FaMusic, FaChevronRight } from "react-icons/fa";
import { useView } from "../../context/ViewContext";
import gsap from "gsap";

const Sidebar = ({ avatarUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef(null);  // Reference to the sidebar element
  const { setSelectedOption } = useView();

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  // Use GSAP to animate the width of the sidebar
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isExpanded ? "14rem" : "4rem", // 16rem for expanded, 4rem for collapsed
        duration: 0.3,
        ease: "circ.inOut", // Smooth easing for the transition
      });
    }
  }, [isExpanded]);

  const options = [
    {
      id: null,
      label: "View Profile",
      icon: (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-5 h-5 rounded-full object-cover"
        />
      ),
    },
    { id: "editProfile", label: "Edit Profile", icon: <FaUserEdit /> },
    { id: "editMusicInfo", label: "Edit Music Info", icon: <FaMusic /> },
  ];

  return (
    <div
      ref={sidebarRef}  // Attach ref to sidebar element
      className="fixed top-0 left-0 h-[calc(100%-160px)] bg-sky-700 text-white z-10"
      style={{ top: "80px" }} // Adjust top to match navbar height
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-center h-16">
        <FaChevronRight
          className={`text-gray-300 transform transition-transform duration-300 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>
      <ul className="mt-4">
        {options.map((option) => (
          <li
            key={option.id}
            className="flex items-center gap-4 p-5 cursor-pointer hover:bg-sky-800 transition-all duration-300 ease-in-out"
            onClick={() => setSelectedOption(option.id)}
          >
            <span className="text-xl flex-shrink-0">{option.icon}</span>
            <span
              className={`whitespace-nowrap transition-opacity duration-300 ease-in-out ${
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              {option.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
