import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Loading = () => {
  const circleRef = useRef(null);

  useEffect(() => {
    // Rotación infinita
    gsap.to(circleRef.current, {
      rotation: 360,
      repeat: -1,
      ease: "linear",
      duration: 2,
    });

    // Efecto pulsante
    gsap.to(circleRef.current, {
      scale: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      duration: 1,
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div
        ref={circleRef}
        className="w-16 h-16 border-4 border-gray-500 border-t-transparent rounded-full"
      />
    </div>
  );
};

export default Loading;
