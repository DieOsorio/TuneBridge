import "./StarBorder.css";

const StarBorder = ({
  as: Component = "button",
  className = "",
  color = "white",
  speed = "6s",
  children,
  glowOnly = false,
  ...rest
}) => {
  return (
    <Component
      className={`star-border-container${
        glowOnly ? " star-border-glow-only" : ""
      } ${className}`}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div className={glowOnly ? undefined : "inner-content"}>{children}</div>
    </Component>
  );
};

export default StarBorder;
