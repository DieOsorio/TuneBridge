import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import { useAuth } from "../../../context/AuthContext";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdForm = ({ defaultValues = {}, onSubmit, publisherId }) => {
  const { t } = useTranslation("ads");
  const { user } = useAuth();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ad_type: defaultValues.ad_type || "",
      looking_for: defaultValues.looking_for || [],
      genres: defaultValues.genres || [],
      location: defaultValues.location || "",
      description: defaultValues.description || "",
      profile_id: publisherId ? null : user.id,
      group_id: publisherId ? publisherId : null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        id="ad_type"
        label={t("adForm.labels.typeOfAd")}
        defaultOption={t("adForm.labels.default")}
        options={[
          { value: "looking", label: t("adForm.labels.looking") },
          { value: "offering", label: t("adForm.labels.offering") },
        ]}
        register={register}
        classForLabel="text-gray-400"
      />

      <Input
        id="looking_for"
        label={t("adForm.labels.looking")}
        placeholder={t("adForm.placeholders.looking")}
        type="text"
        register={register}
        validation={{ required: "looking_for" }}
        error={errors.looking_for}
        classForLabel="!text-gray-400"
      />

      <Input
        id="genres"
        label={t("adForm.labels.genres")}
        placeholder={t("adForm.placeholders.genres")}
        type="text"
        register={register}
        classForLabel="!text-gray-400"
      />

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
            value: 100,
            message: t("adForm.validations.description")
          }
        }}
        error={errors.description}
        maxLength={100}
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
