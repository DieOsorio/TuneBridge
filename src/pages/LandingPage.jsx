import Banner from "../components/ui/Banner";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();
  console.log("LANDINGPAGE render");
  return (
    <>
      {user && user.email_confirmed_at ?
        "" 
        :
        <Banner 
        title="Conecta con otros músicos"
        subtitle="Un lugar donde tu música y tus conexiones crecen."
        backgroundImage="url-a-tu-imagen-de-fondo.jpg" 
      />
      }
      {/* Aquí irán otras secciones de la landing page */}
    </>
  );
};

export default LandingPage;
