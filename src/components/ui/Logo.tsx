import Lottie from "lottie-react";
import logo from "../../assets/TuneBridge.json";
import "./styles/logo.css";
import React from "react";

export interface LogoProps {
  size?: number;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size, color }) => {
  return (
    <Lottie
      animationData={logo}
      autoplay
      loop={true}
      style={{ width: size ? size : 130, color }}
      className={color ? "mono-logo" : ""}
    />
  );
};

export default Logo;
