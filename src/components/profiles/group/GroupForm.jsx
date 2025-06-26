import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";
import { IoIosCamera } from "react-icons/io";

import { useProfileGroups } from "../../../context/profile/ProfileGroupsContext";
import { useAuth } from "../../../context/AuthContext";

import Input        from "../../ui/Input";
import Textarea     from "../../ui/Textarea";
import Button       from "../../ui/Button";
import ProfileAvatar from "../ProfileAvatar";
import ImageUploader from "../../../utils/ImageUploader";
import { uploadFileToBucket } from "../../../utils/avatarUtils";

const GroupForm = ({ group = null, onSave, onCancel }) => {
  const isEdit = Boolean(group);
  const { t } = useTranslation("profileGroup");
  const { createProfileGroup, updateProfileGroup } = useProfileGroups();
  const { user } = useAuth();
  const navigate = useNavigate();

  // react-hook-form  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name:     group?.name     || "",
      bio:      group?.bio      || "",
      country:  group?.country  || "",
      city:     group?.city     || "",
      newGenre: "",
    },
  });

  // local state
  const [avatarUrl,  setAvatarUrl]  = useState(group?.avatar_url || "");
  const [preview,    setPreview]    = useState(null);           // local <img> preview
  const [file,       setFile]       = useState(null);           // File chosen
  const [errorMsg,   setErrorMsg]   = useState("");

  /* Genres with “+” logic */
  const [genres, setGenres] = useState(group?.genres ?? []);
  const newGenre = watch("newGenre")?.trim();

  // avatar picker
  const avatarRef = useRef(null);

  const handleAvatarUpdate = (files) => {
    if (files.length) {
      setFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  // genre chips
  const addGenre = () => {
    if (newGenre && !genres.includes(newGenre) && genres.length < 5) {
      setGenres([...genres, newGenre]);
      setValue("newGenre", "");
    }
  };
  const removeGenre = (tag) => setGenres(genres.filter((g) => g !== tag));

  // submit
  const onSubmit = async (data) => {
    setErrorMsg("");
    try {
      const { newGenre: _discard, ...body } = data; // remove helper field
      let avatar = avatarUrl;

      if (isEdit) {
        //  EDIT
        if (file) {
          avatar = await uploadFileToBucket(
            file,
            "group-avatars",
            group.id,
            group.avatar_url,
            true
          );
        }
        await updateProfileGroup({
          id: group.id,
          updatedGroup: { ...body, avatar_url: avatar, genres },
        });
        onSave?.();
      } else {
        // CREATE
        const created = await createProfileGroup({
          ...body,
          genres,
          avatar_url: "",      // temporary
          created_by: user.id,
        });

        if (file) {
          avatar = await uploadFileToBucket(
            file,
            "group-avatars",
            created.id,
            "",
            false
          );
          // patch newly created group with avatar
          await updateProfileGroup({
            id: created.id,
            updatedGroup: { avatar_url: avatar },
          });
        }
        navigate(`/profile/${user.id}`);
      }

      reset();
    } catch (err) {
      setErrorMsg(err.message || t("errors.default"));
    }
  };

  // UI
  const bannerTitle = isEdit
    ? t("form.titles.edit")
    : t("form.titles.create");

  const submitLabel = isEdit
    ? t("form.buttons.save")
    : t("form.buttons.create");

  const cancel = () => {
    if (isEdit) {
      onCancel?.();
    } else {
      navigate(`/profile/${user.id}`);
    }
  };

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">{bannerTitle}</h2>

      {errorMsg && <p className="text-red-500 mb-4 text-center">{errorMsg}</p>}

      {/* ---------------------- Avatar picker ---------------------- */}
      <div ref={avatarRef} className="relative mx-auto w-fit cursor-pointer group">
        <ProfileAvatar
          group
          className="!bg-amber-700"
          avatar_url={preview || avatarUrl}
        />
        <span className="absolute bottom-1 right-1 bg-white rounded-full p-[2px] shadow-md">
          <IoIosCamera size={20} className="text-gray-700" />
        </span>
      </div>
      <ImageUploader
        amount={1}
        triggerRef={avatarRef}
        onFilesUpdate={handleAvatarUpdate}
        className="my-4"
      />

      {/* ------------------------- FORM --------------------------- */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* left column */}
        <Input
          id="name"
          label={t("form.labels.name")}
          placeholder={t("form.placeholders.name")}
          maxLength={20}
          register={register}
          validation={{ required: t("form.validations.name") }}
          error={errors.name?.message}
          classForLabel="!text-gray-400"
        />

        <Textarea
          id="bio"
          label={t("form.labels.bio")}
          placeholder={t("form.placeholders.bio")}
          maxLength={100}
          register={register}
          validation={{
            maxLength: { value: 100, message: t("form.validations.bioMax") },
          }}
          error={errors.bio}
          watchValue={watch("bio")}
          classForLabel="text-gray-400"
        />

        <Input
          id="country"
          label={t("form.labels.country")}
          placeholder={t("form.placeholders.country")}
          register={register}
          error={errors.country?.message}
          classForLabel="!text-gray-400"
        />

        <Input
          id="city"
          label={t("form.labels.city")}
          placeholder={t("form.placeholders.city")}
          register={register}
          error={errors.city?.message}
          classForLabel="!text-gray-400"
        />

        {/* -------------- Genres with “+” button ---------------- */}
        <div className="sm:col-span-2 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              id="newGenre"
              label={t("form.labels.genres")}
              placeholder={t("form.placeholders.genres")}
              maxLength={12}
              register={register}
              className="!flex-1"
              classForLabel="!text-gray-400"
            />
            <button
              type="button"
              onClick={addGenre}
              disabled={!newGenre || genres.length >= 5}
              className="text-emerald-500 mt-6 p-2 rounded-full hover:text-emerald-700 disabled:opacity-40"
            >
              <FiPlus size={22} />
            </button>
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((g, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-sm rounded bg-emerald-800 text-white flex items-center gap-2"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => removeGenre(g)}
                    className="text-red-300 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ------------------- buttons ------------------- */}
        <div className="sm:col-span-2 flex justify-center gap-4 pt-4">
          <Button
            type="button"
            className="!bg-gray-600 hover:!bg-gray-700"
            onClick={cancel}
          >
            {t("form.buttons.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("form.buttons.saving") : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GroupForm;
