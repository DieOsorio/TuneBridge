import { useParams, useNavigate } from "react-router-dom";
import { useAds } from "../../../context/social/adsContext";
import AdForm from "./AdForm";
import Loading from "../../../utils/Loading";
import { useTranslation } from "react-i18next";

const AdCreateEditPage = ({ publisherId }) => {
  const { t } = useTranslation("ads");
  const { id } = useParams();
  const isEditing = !!id;
  const { fetchAd, createAd, updateAd } = useAds();
  const { data: adData, isLoading } = fetchAd(id, { enabled: isEditing });
  const navigate = useNavigate();

  const handleSubmit = async (formData) => { 
    try {
      const formattedData = {
      ...formData,
      genres: typeof formData.genres === "string" 
        ? formData.genres.split(",").map(g => g.trim()) 
        : formData.genres,
      looking_for: typeof formData.looking_for === "string"
        ? formData.looking_for.split(",").map(l => l.trim())
        : formData.looking_for,
      };

      if (isEditing) {
        await updateAd({ 
          ad: adData, 
          updates: formattedData 
        });
      } else {
        await createAd(formattedData);
      }
      navigate("/ads");
    } catch (err) {
      console.error("Error saving ad:", err);
    }
  };

  if (isEditing && isLoading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl text-center font-bold mb-4">
        {isEditing ? t("adCreateEditPage.title.edit") : t("adCreateEditPage.title.create")}
      </h1>
      <AdForm defaultValues={adData} onSubmit={handleSubmit} publisherId={publisherId} />
    </div>
  );
};

export default AdCreateEditPage;
