import { useEffect, useRef, useState } from "react";

export default function LazyImage({ src, alt, className }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ backgroundColor: "#a1a1aa" }}
    >
      {isVisible && (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
}
