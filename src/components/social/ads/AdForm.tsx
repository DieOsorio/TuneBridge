import { useForm, useWatch } from "react-hook-form";
import Button from "../../ui/Button";
import { useAuth } from "../../../context/AuthContext";
import Select from "../../ui/Select";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";

import type { MusicianAd } from "../../../context/social/adsActions";

interface AdFormProps {
  defaultValues?: Partial<MusicianAd>;
  onSubmit: (data: MusicianAd) => void;
  publisherId?: string | null;
}

const AdForm: React.FC<AdFormProps> = ({ defaultValues = {}, onSubmit, publisherId }) => {
  const { t } = useTranslation("ads");
  const { user } = useAuth();

  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MusicianAd>({
    defaultValues: {
      ad_type: defaultValues.ad_type,
      title: defaultValues.title ?? "",
      looking_for: defaultValues.looking_for ?? [],
      genres: defaultValues.genres ?? [],
      location: defaultValues.location ?? "",
      description: defaultValues.description ?? "",
      profile_id: publisherId ? null : user?.id ?? null,
      group_id: publisherId ?? null,
    },
  });

  const adType = useWatch({ control, name: "ad_type" });

  const [lookingForItems, setLookingForItems] = useState<string[]>(Array.isArray(defaultValues.looking_for) ? defaultValues.looking_for : []);
  const [genreItems, setGenreItems] = useState<string[]>(Array.isArray(defaultValues.genres) ? defaultValues.genres : []);

  const newLookingFor = watch("newLookingFor")?.trim() ?? "";
  const newGenre = watch("newGenre")?.trim() ?? "";

  const handleAddItem = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    field: "newLookingFor" | "newGenre"
  ) => {
    if (value && !list.includes(value) && list.length < 3) {
      setList([...list, value]);
      setValue(field, "");
    }
  };

  const handleRemoveItem = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((item) => item !== value));
  };

  const internalSubmit = (data: any) => {
    const { newLookingFor, newGenre, ...cleanData } = data;
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
        label={t("adForm.labels.typeOfAd")}
        options={[
          { value: "looking", label: t("adForm.labels.looking") },
          { value: "offering", label: t("adForm.labels.offering") },
        ]}
        control={control}
        classForLabel="text-gray-400"
        error={errors.ad_type}
      />

      <Input
        id="title"
        label={t("adForm.labels.title")}
        placeholder={t("adForm.placeholders.title")}
        type="text"
        register={register}
        maxLength={30}
        validation={{
          maxLength: {
            value: 30,
            message: t("adForm.validations.title"),
          },
        }}
        error={errors.title}
        classForLabel="!text-gray-400"
      />

      {/* Looking For */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            id="newLookingFor"
            label={
              adType === "offering"
                ? t("adForm.labels.offering")
                : t("adForm.labels.looking")
            }
            placeholder={
              adType === "offering"
                ? t("adForm.placeholders.offering")
                : t("adForm.placeholders.looking")
            }
            type="text"
            maxLength={12}
            register={register}
            validation={{
              maxLength: {
                value: 12,
                message: t("adForm.validations.looking"),
              },
            }}
            classForLabel="!text-gray-400"
            className="!flex-1"
            error={errors.looking_for}
          />
          <button
            type="button"
            onClick={() =>
              handleAddItem(newLookingFor, lookingForItems, setLookingForItems, "newLookingFor")
            }
            disabled={!newLookingFor || lookingForItems.length >= 3}
            className="text-emerald-500 mt-6 cursor-pointer hover:text-emerald-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiPlus size={22} />
          </button>
        </div>
        {lookingForItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {lookingForItems.map((item, i) => (
              <span
                key={i}
                className="px-2 py-1 text-sm rounded bg-emerald-800 text-white flex items-center gap-2"
              >
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
            maxLength={12}
            validation={{
              maxLength: {
                value: 12,
                message: t("adForm.validations.genre"),
              },
            }}
            classForLabel="!text-gray-400"
            className="!flex-1"
            error={errors.genres}
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
              <span
                key={i}
                className="px-2 py-1 text-sm rounded bg-emerald-800 text-white flex items-center gap-2"
              >
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
        error={errors.location}
      />

      <Textarea
        id="description"
        label={t("adForm.labels.description")}
        placeholder={t("adForm.placeholders.description")}
        register={register}
        validation={{
          maxLength: {
            value: 200,
            message: t("adForm.validations.description"),
          },
        }}
        error={errors.description}
        maxLength={200}
        watchValue={watch("description")}
        classForLabel="text-gray-400"
      />

      <div className="flex justify-center gap-4">
        <Link to={`/ads`}>
          <Button className="!bg-gray-600 hover:!bg-gray-700">
            {t("adForm.buttons.cancel")}
          </Button>
        </Link>
        <Button className="!bg-emerald-600 hover:!bg-emerald-700" type="submit">
          {t("adForm.buttons.save")}
        </Button>
      </div>
    </form>
  );
};

export default AdForm;
