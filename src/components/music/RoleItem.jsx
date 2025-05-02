import React from 'react'
import { FaChevronDown } from 'react-icons/fa'

function RoleItem({ role, expandedRole, handleRoleClick }) {
  return (
    <div
      className={`bg-sky-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-lg font-medium text-gray-700 cursor-pointer hover:bg-gray-200`}
      onClick={() => handleRoleClick(role)}
    >
      <span>{role.role}</span>
      <FaChevronDown  
        className={`mt-2 text-gray-500 transition-transform ${
          expandedRole === role.id ? "rotate-180" : ""
        }`}
      /> {/* Rotate chevron when expanded */}
    </div>
  )
}

export default RoleItem