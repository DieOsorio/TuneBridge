import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth to access signOut
import { useView } from '../../context/ViewContext';

const HamburgerMenu = ({ id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth(); // Access signOut from AuthContext
  const { setSelectedOption } = useView();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Icono del menú */}
      <button
        className="p-3 text-white"
        onClick={toggleMenu}
      >
        <svg className="w-8 h-8 text-white cursor-pointer transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-[-12px] w-48 bg-sky-700 text-white rounded-md shadow-lg mt-2 p-4 transition-all">
          <ul>
            <li onClick={toggleMenu}>
              <Link
                to={`profile/${id}`}
                className="block px-4 py-2 text-lg hover:bg-sky-800 rounded-md"
                onClick={() => setSelectedOption("profile")}
              >
                Profile
              </Link>
            </li>
            <li>
              <button
                onClick={signOut} // Use signOut from AuthContext
                className="cursor-pointer w-full text-left px-4 py-2 text-lg hover:bg-sky-800 rounded-md"
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
