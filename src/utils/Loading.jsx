import Logo from '../components/ui/Logo';

const Loading = ({ size=400, color="#9CA3AF" }) => {

  return (
    <div className="flex justify-center items-center h-screen">
      <Logo size={size} color={color} />
    </div>
  );
};

export default Loading;
