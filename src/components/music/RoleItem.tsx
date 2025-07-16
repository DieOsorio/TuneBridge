import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';
import React from 'react';

export interface RoleItemProps {
  role: {
    id: string | number;
    role: string;
    [key: string]: any;
  };
  expandedRole: string | number | undefined;
  handleRoleClick: (role: { id: string | number; role: string; [key: string]: any }) => void;
}

const RoleItem: React.FC<RoleItemProps> = ({ role, expandedRole, handleRoleClick }) => {
  const { t } = useTranslation('music');
  const isExpanded = expandedRole === role.id;

  return (
    <div
      className={`p-5 rounded-xl shadow-md border transition-all duration-300 cursor-pointer text-white text-center select-none
        ${isExpanded ? "border-sky-500 bg-sky-800/30" : "border-gray-700 bg-gray-800 hover:border-sky-500 hover:bg-gray-700/60"}
      `}
      onClick={() => handleRoleClick(role)}
    >
      <span className="text-lg font-semibold tracking-wide">
        {t(`roles.${role.role.toLowerCase()}`)}
      </span>
      <div className="mt-2 flex justify-center">
        <FaChevronDown
          className={`text-gray-400 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default RoleItem;
