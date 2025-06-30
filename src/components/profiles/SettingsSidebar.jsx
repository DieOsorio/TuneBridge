import { useState, useEffect, useRef } from "react";
import { FaChevronRight } from "react-icons/fa";
import { IoMusicalNotesOutline, IoMusicalNotes } from "react-icons/io5"
import { BsBell, BsBellFill } from "react-icons/bs";
import { TiMediaFastForwardOutline, TiMediaFastForward } from "react-icons/ti";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import { FiDatabase, FiKey, FiLock, FiUser } from "react-icons/fi";
import { FaDatabase, FaKey, FaLock, FaUser } from "react-icons/fa";
import { useMediaQuery } from "@mui/material";

const SettingsSidebar = ({ avatarUrl }) => {
  const { t } = useTranslation("ui", { keyPrefix: "sidebar" });
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isDesktop = useMediaQuery("(min-width:760px)");

  const hasMounted = useRef(false);

  const handleMouseEnter = () => isDesktop && setIsExpanded(true);
  const handleMouseLeave = () => isDesktop && setIsExpanded(false);



  useEffect(() => {
    if (!sidebarRef.current) return;

    if (!hasMounted.current) {
      gsap.set(sidebarRef.current, { width: "4rem" });
      hasMounted.current = true;
      return;
    }

    gsap.to(sidebarRef.current, {
      width: isExpanded && isDesktop ? "16rem" : "4rem",
      duration: 0.3,
      ease: "circ.inOut",
    });
  }, [isExpanded]);

  useEffect(() => {
    const onResize = () => !isDesktop && setIsExpanded(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Define options with paths that match Settings routes
  const options = [
    {
      to: "/settings/profile",
      label: t("profileSettings"),
      icon: (active) =>
        active ? (
          <img src={avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover ring-2 ring-yellow-600" />
        ) : (
          <img src={avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
        ),
    },
    {
      to: "/settings/account",
      label: t("accountSettings"),
      icon: (active) => (active ? <FaUser /> : <FiUser />),
    },
    {
      to: "/settings/privacy",
      label: t("privacySettings"),
      icon: (active) => (active ? <FaLock /> : <FiLock />),
    },
    {
      to: "/settings/notifications",
      label: t("notificationsSettings"),
      icon: (active) => (active ? <BsBellFill /> : <BsBell />),
    },
    {
      to: "/settings/music",
      label: t("musicSettings"),
      icon: (active) => (active ? <IoMusicalNotes /> : <IoMusicalNotesOutline />),
    },
    {
      to: "/settings/media",
      label: t("mediaSettings"),
      icon: (active) =>
        active ? <TiMediaFastForward /> : <TiMediaFastForwardOutline />,
    },
    // {
    //   to: "/settings/apps",
    //   label: t("appsSettings"),
    //   icon: (active) => (active ? <FaKey /> : <FiKey />),
    // },
    // {
    //   to: "/settings/data",
    //   label: t("dataSettings"),
    //   icon: (active) => (active ? <FaDatabase /> : <FiDatabase />),
    // },
  ];

  return (
    <div
      ref={sidebarRef}
      className="fixed top-20 left-0 h-[calc(100%-80px)] bg-gradient-to-b from-gray-950 to-gray-900 text-white z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width: "4rem" }}
    >
      {isDesktop &&
        <div className="flex items-center justify-center h-16">
        <FaChevronRight
          className={`text-gray-300 transform transition-transform duration-300 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>
      }

      {/* Options */}
      <ul className="mt-4">
        {options.map(({ to, label, icon }) => {
          const isActive = location.pathname === to;
          return (
            <li
              key={to}
              className={`flex items-center justify-between gap-4 p-4 cursor-pointer transition-all duration-300 ease-in-out ${
                isActive
                  ? "bg-sky-700 font-semibold"
                  : "hover:bg-gray-800"
              }`}
              onClick={() => navigate(to)}
            >
              <span className="text-xl flex-shrink-0 ml-1 text-yellow-600">
                {icon(isActive)}
              </span>
              <span
                className={`whitespace-nowrap transition-opacity duration-300 ease-in-out ${
                  isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SettingsSidebar;
