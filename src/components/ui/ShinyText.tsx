import React from "react";
import "./styles/ShinyText.css";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  className?: string;
  speed?: number;
  style?: React.CSSProperties;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, className = "" }) => {
  return (
    <span
      className={`shiny-text ${disabled ? "disabled" : ""} ${className}`.trim()}
    >
      {text}
    </span>
  );
};

export default ShinyText;
