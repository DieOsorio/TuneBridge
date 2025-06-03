const Logo = ({ text }) => {
  return (
    <h1 
    style={{ fontFamily: "'Great Vibes', cursive" }}
    className="text-4xl font-bold bg-gradient-to-r from-orange-300 via-orange-500 to-orange-700 text-transparent bg-clip-text drop-shadow-md select-none p-4">
      {text}
    </h1>
  );
};

export default Logo;
