import './ShinyText.css';

// Simple shiny/gradient text effect using Tailwind and a moving gradient overlay
const ShinyText = ({ text, disabled = false, speed = 5, className = '', style = {} }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={{ animationDuration, ...style }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
