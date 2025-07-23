import { useParams, useNavigate } from "react-router-dom";
import { useAds } from "../../../context/social/adsContext";
import AdForm from "./AdForm";
import Loading from "../../../utils/Loading";
import { useTranslation } from "react-i18next";

import type { MusicianAd } from "../../../context/social/adsActions";

export default function AdCreateEditPage() {
  const { t } = useTranslation("ads");
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const { fetchAd, createAd, updateAd } = useAds();
  const { data: adData, isLoading } = id
  ? fetchAd(id)
  : { data: undefined, isLoading: false };


  const navigate = useNavigate();

  // Handler para submit del formulario, recibe datos tipados con AdFormValues
  const handleSubmit = async (formData: MusicianAd) => {
    try {
      const formattedData = {
        ...formData,
        genres: typeof formData.genres === "string"
          ? (formData.genres as string).split(",").map((g: string) => g.trim())
          : formData.genres,
        looking_for: typeof formData.looking_for === "string"
          ? (formData.looking_for as string).split(",").map((l: string) => l.trim())
          : formData.looking_for,
      };

      if (isEditing && adData) {
        await updateAd({
          ad: adData,
          updates: formattedData,
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
      <h1 className="text-2xl text-yellow-600 font-semibold text-center mb-4">
        {isEditing
          ? t("adCreateEditPage.title.edit")
          : t("adCreateEditPage.title.create")}
      </h1>
      {/* ! Importante: adData puede ser undefined, si quieres forzar, asegúrate antes */}
      <AdForm defaultValues={adData ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}

