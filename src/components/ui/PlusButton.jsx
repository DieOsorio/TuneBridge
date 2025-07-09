import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/* palette map */
const PALETTE = {
  emerald: {
    text: "text-emerald-500",
    hover: "hover:text-emerald-700",
    ring: "focus:ring-emerald-400",
  },
  amber: {
    text: "text-amber-600",
    hover: "hover:text-amber-700",
    ring: "focus:ring-amber-400",
  },
  sky: {
    text: "text-sky-400",
    hover: "hover:text-sky-300",
    ring: "focus:ring-sky-300",
  },
};

function PlusButton({
  label,
  to,
  onClick,
  iconSize = 28,
  mobileIconSize = 32,
  showLabelOnMobile = true,
  color = "emerald",
  slide = "left", // "left" | "right"
  className = "",
  ...props
}) {
  const navigate = useNavigate();
  const palette = PALETTE[color] || PALETTE.emerald;

  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  const btnBase = `cursor-pointer p-2 rounded-full transition-colors ${palette.text} ${palette.hover} ${palette.ring}`;

  /* slide direction helpers */
  const slidePos   =
    slide === "right"
      ? "left-full -translate-x-4 group-hover:translate-x-0 mr-2"
      : "right-full  translate-x-4 group-hover:translate-x-0 ml-2";

  return (
    <div className={`items-center mb-4 ${className}`}>
      {/* desktop */}
      <div className="relative mb-4 hidden md:flex justify-end items-center">
        <div className="group relative">
          <button type="button" onClick={handleClick} className={btnBase} {...props}>
            <FiPlus size={iconSize} />
          </button>

          <span
            className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap ${slidePos} 
              ${palette.text} font-semibold text-base px-3 py-1 rounded-lg shadow
              opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
          >
            {label}
          </span>
        </div>
      </div>

      {/* mobile */}
      <div className="flex items-center md:hidden space-x-2">
        <button type="button" onClick={handleClick} className={btnBase}>
          <FiPlus size={mobileIconSize} />
        </button>

        {showLabelOnMobile && (
          <span
            onClick={handleClick}
            className={`${palette.text} ${palette.hover} font-semibold cursor-pointer`}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export default PlusButton;
