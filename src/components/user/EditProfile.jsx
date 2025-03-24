import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProfilePicture from "./ProfileAvatar";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return; // Si no hay usuario, no cargamos nada

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username, role, age, gender")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        // Establecemos valores predeterminados si los datos no existen
        setUsername(data?.username || "");
        setRole(data?.role || "");
        setAge(data?.age || "");
        setGender(data?.gender || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username,
        role,
        age,
        gender,
      });

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
        {user && <ProfilePicture userId={user.id} />}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Instrumento o rol"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
          <Input
            label="Edad"
            type="number"
            value={age || ""} // Si `age` es null, mostramos ""
            onChange={(e) => setAge(e.target.value)}
          />
          <Input
            label="Género"
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
