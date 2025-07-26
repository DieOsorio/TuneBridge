import { useEffect, useRef, useState } from "react";
import React from "react";

export interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
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
};

export default LazyImage;
