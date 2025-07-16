import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import React from "react";

export interface BannerProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  button: string;
  user?: any;
}

const Banner: React.FC<BannerProps> = ({ title, subtitle, backgroundImage, button, user }) => {
  const titleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    gsap.fromTo(titleRefs.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        delay: 0.2
      }
    );

    gsap.fromTo(textRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 1.3 }
    );

    gsap.fromTo(buttonRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1, delay: 2 }
    );
  }, []);

  const words = title.split(". ").map(w => w.trim()).filter(Boolean);

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: `url(\"${backgroundImage}\")` }}
    >
      <div className="absolute inset-0 bg-black/0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-light mb-4 mt-70 sm:mt-60 flex flex-wrap justify-center gap-2">
          {words.map((word, i) => (
            <span
              key={i}
              ref={el => { titleRefs.current[i] = el; }}
              className={`inline-block ${i === words.length - 1 ? "text-amber-600/70" : "text-sky-500/70"}`}
            >
              {word}.
            </span>
          ))}
        </h1>
        {/* <p ref={textRef} className="text-lg max-w-xl my-6">
          {subtitle}
        </p> */}
        {!user && (
          <Link to="/signup">
            <button
              ref={buttonRef}
              className="px-10 py-3 mt-4 bg-sky-600 text-white rounded-lg text-lg font-semibold hover:bg-sky-700 transition"
            >
              {button}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Banner;
