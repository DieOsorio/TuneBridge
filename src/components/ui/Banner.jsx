import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Banner = ({ title, subtitle, backgroundImage }) => {
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 });
    gsap.fromTo(textRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.5 });
    gsap.fromTo(buttonRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1, delay: 1 });
  }, []);
  

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: `url("${backgroundImage}")` }}
    >

      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
        <h1 ref={titleRef} className="text-5xl md:text-6xl font-bold mb-4">{title}</h1>
        <p ref={textRef} className="text-lg md:text-2xl max-w-xl mb-6">{subtitle}</p>
        <Link to="/signup">
          <button
            ref={buttonRef}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
          >
            Explore Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Banner;
