import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProfileAvatar from "./ProfileAvatar";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [avatar_url, setAvatar_url] = useState("");
  const [instrument, setInstrument] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [is_singer, setIs_singer] = useState(false);
  const [is_composer, setIs_composer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchProfileData(user.id);
    }
  }, [user, navigate]);

  const fetchProfileData = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) console.error(error);
    else {
      setProfileData(data);
      // Inicializamos los valores de los estados con los datos obtenidos
      setUsername(data.username || "");
      setGender(data.gender || "");
      setAvatar_url(data.avatar_url || "");
      setInstrument(data.instrument || "");
      setBirthdate(data.birthdate || "");
      setIs_singer(data.is_singer || false);
      setIs_composer(data.is_composer || false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        gender,
        avatar_url,
        instrument,
        is_singer,
        is_composer,
        birthdate
      })
      .eq("id", profileData.id)
      .select();

    if (error) {
      setError("Error al actualizar el perfil.");
      console.error(error);
    } else {
      navigate(`/profile/${user.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Editar Perfil</h2>
        {user && <ProfileAvatar userId={user.id} />}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de usuario"
            placeholder={username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Instrumento"
            placeholder={instrument}
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
          />
          <Input
            type="checkbox"
            label="Cantante"
            checked={is_singer}
            onChange={(e) => setIs_singer(e.target.value)}
          />
          <Input
            type="checkbox"
            label="Compositor"
            checked={is_composer}
            onChange={(e) => setIs_composer(e.target.value)}
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            placeholder={birthdate}
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
          <Input
            label="Género"
            placeholder={gender}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
