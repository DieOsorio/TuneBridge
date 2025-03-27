import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { handleLogout } from '../../utilis/authHelper';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Icono del menú */}
      <button
        className="lg:hidden p-3 text-white"
        onClick={toggleMenu}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 w-48 bg-gray-800 text-white rounded-md shadow-lg mt-2 p-4">
          <ul>
            <li>
              <Link
                to="/profile"
                className="block px-4 py-2 text-lg hover:bg-gray-700 rounded-md"
                onClick={toggleMenu}
              >
                Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-lg hover:bg-gray-700 rounded-md"
              >
                Sign Out
              </button>
            </li>
            {/* Puedes agregar más enlaces aquí si lo necesitas */}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
