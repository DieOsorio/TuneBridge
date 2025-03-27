

const Banner = ({ title, subtitle, backgroundImage }) => {
  return (
    <div 
      className="relative w-full h-[500px] bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center px-4 py-6 bg-black bg-opacity-50 rounded-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-xl md:text-2xl mb-6">{subtitle}</p>
        <button className="px-6 py-2 text-lg font-semibold bg-white text-black rounded-md hover:bg-black hover:text-white transition">
          Únete a MusicConnects
        </button>
      </div>
    </div>
  );
};

export default Banner;
