import Lottie from "lottie-react";
import logo from "../../assets/TuneBridge.json";
import "./styles/logo.css";

const Logo = ({ size, color }) => {
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
