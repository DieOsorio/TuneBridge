import { Component } from 'react';
import './ButtonGlow.css';

const Button = ({ 
  type = "button", 
  children, 
  onClick, 
  className = "", 
  starBorder = false,
  speed = "6s",
  color = "white",
  ...props 
}) => {
  if (starBorder) {
    return (
      <span className={`star-border-container px-4 py-2 font-bold w-50 rounded-md cursor-pointer text-gray-200 ${className}`} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <span 
          className="border-gradient-bottom"
          style={{
            background: `radial-gradient(circle, ${color}, transparent 10%)`,
            animationDuration: speed,
            pointerEvents: 'none',
          }}
        />
        <span 
          className="border-gradient-top"
          style={{
            background: `radial-gradient(circle, ${color}, transparent 10%)`,
            animationDuration: speed,
            pointerEvents: 'none',
          }}
        />
        <button
          type={type}
          onClick={onClick}
          className="inner-content cursor-pointer"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            margin: 0,
            display: 'block',
          }}
          {...props}
        >
          {children}
        </button>
      </span>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 font-bold w-50 rounded-md cursor-pointer bg-sky-600 text-gray-200 hover:bg-sky-700 transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
