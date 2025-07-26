import { useState, useEffect, useRef } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useMediaQuery } from "@mui/material";

export interface SettingsSidebarOption {
  to: string;
  label: string;
  icon: (isActive: boolean) => React.ReactNode;
}

export interface SettingsSidebarProps {
  avatarUrl?: string;
  options: SettingsSidebarOption[];
}

const SettingsSidebar = ({ options }: SettingsSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
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
  }, [isExpanded, isDesktop]);

  useEffect(() => {
    const onResize = () => !isDesktop && setIsExpanded(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isDesktop]);

  return (
    <div
      ref={sidebarRef}
      className="fixed top-20 left-0 h-[calc(100%-80px)] bg-gradient-to-b from-gray-950 to-gray-900 text-white z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width: "4rem" }}
    >
      {isDesktop && (
        <div className="flex items-center justify-center h-16">
          <FaChevronRight
            className={`text-gray-300 transform transition-transform duration-300 ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      )}

      <ul className="mt-4">
        {options.map(({ to, label, icon }) => {
          const isActive = location.pathname === to;
          return (
            <li
              key={to}
              className={`flex items-center justify-between gap-4 p-4 cursor-pointer transition-all duration-300 ease-in-out ${
                isActive ? "bg-sky-700 font-semibold" : "hover:bg-gray-800"
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
