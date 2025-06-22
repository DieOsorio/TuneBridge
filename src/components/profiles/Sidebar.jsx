import { useState, useEffect, useRef } from "react";
import { FaTimes, FaChevronRight, FaUserEdit, FaMusic } from "react-icons/fa";
import { TiMediaFastForward } from "react-icons/ti";
import { useView } from "../../context/ViewContext";
import { useSidebar } from "../../context/SidebarContext";
import gsap from "gsap";
import { useTranslation } from "react-i18next";

const Sidebar = ({ avatarUrl }) => {
  const { t } = useTranslation("ui");
  const { isSidebarVisible, closeSidebar } = useSidebar();
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef(null);  // Reference to the sidebar element
  const { manageView } = useView();

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);

  const hasMounted = useRef(false);

  // Use GSAP to animate the width of the sidebar
  useEffect(() => {
    if (!sidebarRef.current) return;

    if (isSidebarVisible && !hasMounted.current) {
      gsap.set(sidebarRef.current, {
        width: "4rem",
      });
      hasMounted.current = true;
      return;
    }

    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isExpanded ? "16rem" : "4rem", // 16rem for expanded, 4rem for collapsed
        duration: 0.3,
        ease: "circ.inOut", // Smooth easing for the transition
      });
    }
  }, [isExpanded, isSidebarVisible]);

  if (!isSidebarVisible) return null;

  const options = [
    {
      external: "profile",
      internal: "about",
      label: t("sidebar.viewProfile"),
      icon: (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-5 h-5 rounded-full object-cover"
        />
      ),
    },
    { external: "edit",
      internal: "editProfile", 
      label: t("sidebar.editProfile"),
      icon: <FaUserEdit /> },
    { external: "edit",
      internal: "editMusicInfo", 
      label: t("sidebar.editMusicInfo"),
      icon: <FaMusic /> },
    { external: "edit",
      internal: "insertMedia", 
      label: t("sidebar.insertMedia"),
      icon: <TiMediaFastForward size={25} /> },
  ];

  return (
    <div
      ref={sidebarRef}  // Attach ref to sidebar element
      className="hidden md:block fixed top-0 left-0 h-[calc(100%-160px)] bg-gradient-to-b from-gray-950 to-gray-900 text-white z-10"
      style={{ 
        top: "80px",
      }} // Adjust top to match navbar height
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Close Sidebar */}
      <div className="flex justify-end p-2">
        <button onClick={closeSidebar} title="Close Sidebar">
          <FaTimes size={20} className="text-gray-500 cursor-pointer hover:text-red-700 transition" />
        </button>
      </div>

      <div className="flex items-center justify-center h-16">
        <FaChevronRight
          className={`text-gray-300 transform transition-transform duration-300 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {/* Options */}
      <ul className="mt-4">
        {options.map((option) => (
          <li
            key={option.internal}
            className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-sky-600 transition-all duration-300 ease-in-out"
            onClick={() => manageView(option.internal, option.external)}
          >
            <span className="text-xl flex-shrink-0 text-yellow-600">
              {option.icon}
            </span>
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
