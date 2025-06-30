import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Logo from '../components/ui/Logo';

const Loading = ({ size=400, color="#9CA3AF" }) => {
  const circleRef = useRef(null);

  useEffect(() => {
    // infinite rotation
    gsap.to(circleRef.current, {
      rotation: 360,
      repeat: -1,
      ease: "linear",
      duration: 2,
    });

    // pulsing effect
    gsap.to(circleRef.current, {
      scale: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      duration: 1,
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      {/* <div
        ref={circleRef}
        classNam
        e="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full"
      /> */}
      <Logo size={size} color={color} />
    </div>
  );
};

export default Loading;
