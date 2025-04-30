import Banner from "../components/ui/Banner";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <>
      {/* {user && user.email_confirmed_at ? null : (
        <Banner
          title="Conecta con otros músicos"
          subtitle="Un lugar donde tu música y tus conexiones crecen."
          backgroundImage="url-a-tu-imagen-de-fondo.jpg"
        />
      )} */}
      <Banner
          title="Conecta con otros músicos"
          subtitle="Un lugar donde tu música y tus conexiones crecen."
          backgroundImage="/rhythmic-hands-drumming-stockcake.jpg"
        />        
    </>
  );
  
};

export default LandingPage;
