import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Banner = ({ title, subtitle, backgroundImage }) => {
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );

    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power2.out" }
    );

    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1, delay: 1, ease: "elastic.out(1, 0.5)" }
    );
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center">
      <h1 ref={titleRef} className="text-5xl font-bold">Bienvenido a TuneBridge</h1>
      <p ref={textRef} className="mt-4 text-lg max-w-lg">
        Descubre la mejor plataforma para conectar músicos y crear nuevas experiencias sonoras.
      </p>
      <button
        ref={buttonRef}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all"
      >
        Explorar Ahora
      </button>
    </div>
  );
    // <div 
    //   className="relative w-full h-[500px] bg-cover bg-center text-white"
    //   style={{ backgroundImage: `url(${backgroundImage})` }}
    // >
    //   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center px-4 py-6 bg-black bg-opacity-50 rounded-lg">
    //     <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
    //     <p className="text-xl md:text-2xl mb-6">{subtitle}</p>
    //     <Link to={"/signup"}>
    //     <button className="px-6 py-2 text-lg font-semibold bg-white text-black rounded-md hover:bg-black hover:text-white transition">
    //       Únete a MusicConnects
    //     </button>
    //     </Link>
    //   </div>
    // </div>  
};

export default Banner;
