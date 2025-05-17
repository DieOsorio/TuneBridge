import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";
import Loading from "../../utils/Loading";
import EditProfile from "../profiles/EditProfile";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

const AccountConfirmed = () => {
  const { user, loading } = useAuth();
  const { fetchProfile } = useProfile();
  const { data: profile, isLoading: profileLoading } = fetchProfile(user?.id);

  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

  if (loading || profileLoading) {
    return <Loading />;
  }

  return (
    <div className="text-center py-6 px-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-green-300 mb-4">Account confirmed!</h1>
      <p className="text-lg text-gray-500 mb-6">
        Welcome to TuneBridge! You're all set to begin. To help others get to know you better, start by adding some basic information about yourself — like your name, location, and a short bio.
      </p>

      {!showEditor ? (
        <Button onClick={() => setShowEditor(true)} className="mx-auto">
          Complete My Profile
        </Button>
      ) : (
        <EditProfile 
        profile={profile}
        onSave={() => navigate(`/profile/${user.id}`)}
        onCancel={() => setShowEditor(false)} 
        />
      )}
    </div>
  );
};

export default AccountConfirmed;
