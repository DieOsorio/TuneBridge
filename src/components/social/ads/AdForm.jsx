import { useForm, useWatch } from "react-hook-form";
import Button from "../../ui/Button";
import { useAuth } from "../../../context/AuthContext";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";

const AdForm = ({ defaultValues = {}, onSubmit, publisherId }) => {
  const { t } = useTranslation("ads");
  const { user } = useAuth();

  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ad_type: defaultValues.ad_type || "",
      title: defaultValues.title || "",
      looking_for: defaultValues.looking_for || [],
      genres: defaultValues.genres || [],
      location: defaultValues.location || "",
      description: defaultValues.description || "",
      profile_id: publisherId ? null : user.id,
      group_id: publisherId ? publisherId : null,
    },
  });

  const adType = useWatch({ control, name: "ad_type" });

  const [lookingForItems, setLookingForItems] = useState(defaultValues.looking_for || []);
  const [genreItems, setGenreItems] = useState(defaultValues.genres || []);

  const newLookingFor = watch("newLookingFor")?.trim();
  const newGenre = watch("newGenre")?.trim();

  const handleAddItem = (value, list, setList, field) => {
    if (value && !list.includes(value) && list.length < 3) {
      setList([...list, value]);
      setValue(field, "");
    }
  };

  const handleRemoveItem = (value, list, setList) => {
    setList(list.filter((item) => item !== value));
  };

  const internalSubmit = (data) => {
    const { newLookingFor, newGenre, ...cleanData} = data
    onSubmit({
      ...cleanData,
      looking_for: lookingForItems,
      genres: genreItems,
    });
  };

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
      <Select
        id="ad_type"
        name="ad_type"
        label={t("adForm.labels.typeOfAd")}
        defaultOption={t("adForm.labels.default")}
        options={[
          { value: "looking", label: t("adForm.labels.looking") },
          { value: "offering", label: t("adForm.labels.offering") },
        ]}
        control={control}
        register={register}
        classForLabel="text-gray-400"
      />

      <Input
        id="title"
        label={t("adForm.labels.title")}
        placeholder={t("adForm.placeholders.title")}        
        type="text"
        register={register}
        validation={{
            maxLength: {
              value: 30,
              message: t("adForm.validations.title"),
            }
          }}
        error={errors.title}
        classForLabel="!text-gray-400"
      />

      {/* Looking For */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            id="newLookingFor"
            label={adType === "offering" 
            ? t("adForm.labels.offering")
            : t("adForm.labels.looking")}
            placeholder={adType === "offering" 
            ? t("adForm.placeholders.offering")
            : t("adForm.placeholders.looking")}
            type="text"
            register={register}
            classForLabel="!text-gray-400"
            className="!flex-1"
          />
          <button
            type="button"
            onClick={() => handleAddItem(newLookingFor, lookingForItems, setLookingForItems, "newLookingFor")}
            disabled={!newLookingFor || lookingForItems.length >= 3}
            className="text-emerald-500 mt-6 cursor-pointer hover:text-emerald-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiPlus size={22} />
          </button>
        </div>
        {lookingForItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {lookingForItems.map((item, i) => (
              <span key={i} className="px-2 py-1 text-sm rounded bg-emerald-800 text-white flex items-center gap-2">
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item, lookingForItems, setLookingForItems)}
                  className="text-red-400 hover:text-red-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Genres */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            id="newGenre"
            label={t("adForm.labels.genres")}
            placeholder={t("adForm.placeholders.genres")}
            type="text"
            register={register}
            classForLabel="!text-gray-400"
            className="!flex-1"
          />
          <button
            type="button"
            onClick={() => handleAddItem(newGenre, genreItems, setGenreItems, "newGenre")}
            disabled={!newGenre || genreItems.length >= 3}
            className="text-emerald-500 mt-6 cursor-pointer hover:text-emerald-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiPlus size={22} />
          </button>
        </div>
        {genreItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {genreItems.map((item, i) => (
              <span key={i} className="px-2 py-1 text-sm rounded bg-emerald-800 text-white flex items-center gap-2">
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item, genreItems, setGenreItems)}
                  className="text-red-400 hover:text-red-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Input
        id="location"
        label={t("adForm.labels.location")}
        placeholder={t("adForm.placeholders.location")}
        type="text"
        register={register}
        classForLabel="!text-gray-400"
      />

      <Textarea 
        id="description"
        label={t("adForm.labels.description")}
        placeholder={t("adForm.placeholders.description")}
        register={register}
        validation={{
          maxLength: {
            value: 200,
            message: t("adForm.validations.description")
          }
        }}
        error={errors.description}
        maxLength={200}
        watchValue={watch("description")}
        classForLabel="text-gray-400"
      />

      <div className="flex justify-center gap-4">
        <Link to={`/ads`}>
          <Button className="!bg-gray-500 hover:!bg-gray-600" >
            {t("adForm.buttons.cancel")}
          </Button>
        </Link>
        <Button className="!bg-emerald-700 hover:!bg-emerald-800" type="submit">
          {t("adForm.buttons.save")}
        </Button>
      </div>
    </form>
  );
};

export default AdForm;
