import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const navItems = [
  { key: "roles", to: "/admin/roles" },
  { key: "reports", to: "/admin/reports" },
  { key: "feedback", to: "/admin/feedback" },
  { key: "bans", to: "/admin/bans" },
  { key: "logs", to: "/admin/logs" },
];

export default function AdminNav() {
  const { t } = useTranslation("admin", { keyPrefix: "nav" });

  return (
    <nav className="w-full lg:w-64 bg-gradient-to-b from-gray-800 text-white p-4 rounded-md">
      <ul className="space-y-2">
        {navItems.map(({ key, to }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `block px-2 py-3 text-center rounded-md border-b border-gray-600 hover:bg-gray-700 transition-all ${
                  isActive ? "bg-gray-700 font-semibold" : ""
                }`
              }
              end
            >
              {t(key)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
