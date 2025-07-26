import React, { useState, useRef, useEffect } from "react";
import { useForm, FieldErrors, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";
import { IoIosCamera } from "react-icons/io";

import { useProfileGroups } from "../../../context/profile/ProfileGroupsContext";
import { useAuth } from "../../../context/AuthContext";

import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import Select from "../../ui/Select";
import ProfileAvatar from "../ProfileAvatar";
import ImageUploader from "../../../utils/ImageUploader";
import { uploadFileToBucket } from "../../../utils/avatarUtils";

import type { ProfileGroup as Group } from "@/context/profile/profileGroupsActions";

import {
  useCountries,
  useStates,
  useCities,
} from "../../../context/helpers/useCountryCity";
import { Country } from "country-state-city";
import { ActualFileObject } from "filepond";

type Nullable<T> = T | null;

const cleanStateName = (name?: string): string | undefined =>
  name?.endsWith(" Department") ? name.replace(/ Department$/, "") : name;


interface FormInputs {
  name: string;
  bio: string;
  country: string;
  state: string;
  city: string;
  newGenre: string;
}

interface GroupFormProps {
  group?: Group | null;
  onSave?: () => void;
  onCancel?: () => void;
}

const GroupForm = ({ group = null, onSave, onCancel }: GroupFormProps) => {
  const isEdit = Boolean(group);
  const { t } = useTranslation("profileGroup");
  const { createProfileGroup, updateProfileGroup } = useProfileGroups();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      name: group?.name || "",
      bio: group?.bio || "",
      country: "", // ISO-2, filled in useEffect
      state: "",
      city: "",
      newGenre: "",
    },
  });

  /* avatar local state */
  const [avatarUrl, setAvatarUrl] = useState<string>(group?.avatar_url ?? "");
  const [preview, setPreview] = useState<Nullable<string>>(null);
  const [file, setFile] = useState<Nullable<File>>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  /* genres chip logic */
  const [genres, setGenres] = useState<string[]>(group?.genres ?? []);
  const newGenre = watch("newGenre")?.trim();

  /* location selector data */
  const countryIso = watch("country");
  const stateIso = watch("state");

  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStates(countryIso);
  const { data: cities = [] } = useCities(countryIso, stateIso);

  /* pre-populate location fields when editing */
  useEffect(() => {
    if (!group) return;

    const countryIso =
      Country.getAllCountries().find((c) => c.name === group.country)?.isoCode || "";
    setValue("country", countryIso);
  }, [group, setValue]);

  useEffect(() => {
    if (!group || !states.length) return;

    const stateIso =
      states.find((s) => cleanStateName(s.name) === group.state)?.isoCode || "";
    setValue("state", stateIso);
  }, [group, states, setValue]);

  useEffect(() => {
    if (!group || !cities.length) return;

    setValue("city", group.city || "");
  }, [group, cities, setValue]);

  /* avatar uploader */
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const handleAvatarUpdate = (files: ActualFileObject[]) => {
    if (files.length) {
      const file = files[0] as File;
      setFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  /* submit */
  const onSubmit = async (data: FormInputs) => {
    setErrorMsg("");
    try {
      const { newGenre: _omit, ...body } = data;

      /* normalize country / state names */
      const countryName =
        Country.getCountryByCode(body.country)?.name || body.country;
      const stateName =
        cleanStateName(
          states.find((s) => s.isoCode === body.state)?.name || body.state
        ) || "";

      let avatar: string = avatarUrl;

      /* upload avatar if changed */
      if (file) {
        avatar = await uploadFileToBucket(
          file,
          "group-avatars",
          isEdit ? group!.id : user!.id,
          avatarUrl, 
          true
        );
      }

      if (isEdit) {
        await updateProfileGroup({
          id: group!.id,
          updatedGroup: {
            ...body,
            country: countryName,
            state: stateName,
            city: body.city,
            genres,
            avatar_url: avatar,
          },
        });
        onSave?.();
      } else {
        const created = await createProfileGroup({
          ...body,
          country: countryName,
          state: stateName,
          city: body.city,
          genres,
          avatar_url: "", // temp
          created_by: user!.id,
        });

        if (file) {
          avatar = await uploadFileToBucket(
            file,
            "group-avatars",
            created.id,
            "",
            false
          );
          await updateProfileGroup({
            id: created.id,
            updatedGroup: { avatar_url: avatar },
          });
        }
        navigate(`/profile/${user!.id}`);
      }
      reset();
    } catch (err: any) {
      setErrorMsg(err?.message || t("errors.default"));
    }
  };

  /* UI labels */
  const bannerTitle = isEdit ? t("form.titles.edit") : t("form.titles.create");
  const submitLabel = isEdit ? t("form.buttons.save") : t("form.buttons.create");

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4 text-yellow-600">
        {bannerTitle}
      </h2>

      {errorMsg && <p className="text-red-500 mb-4 text-center">{errorMsg}</p>}

      {/* avatar picker */}
      <div ref={avatarRef} className="relative mx-auto w-fit cursor-pointer group">
        <ProfileAvatar group avatar_url={preview || avatarUrl} />
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

      {/* form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Textarea
          id="bio"
          label={t("form.labels.bio")}
          placeholder={t("form.placeholders.bio")}
          maxLength={100}
          register={register}
          validation={{ maxLength: { value: 100, message: t("form.validations.bioMax") } }}
          error={errors.bio as FieldErrors | undefined}
          watchValue={watch("bio")}
        />

        <Input
          id="name"
          label={t("form.labels.name")}
          placeholder={t("form.placeholders.name")}
          maxLength={20}
          register={register}
          validation={{ required: t("form.validations.name") }}
          error={errors.name?.message}
        />

        {/* genres chip selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              id="newGenre"
              label={t("form.labels.genres")}
              placeholder={t("form.placeholders.genres")}
              maxLength={12}
              register={register}
              className="!flex-1"
            />
            <button
              type="button"
              onClick={() => {
                if (newGenre && !genres.includes(newGenre) && genres.length < 5) {
                  setGenres([...genres, newGenre]);
                  setValue("newGenre", "");
                }
              }}
              disabled={!newGenre || genres.length >= 5}
              className="text-emerald-500 mt-6 p-2 rounded-full hover:text-emerald-700 disabled:opacity-40"
            >
              <FiPlus size={22} />
            </button>
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-1 text-sm rounded bg-emerald-800 text-white flex items-center gap-2"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => setGenres(genres.filter((x) => x !== g))}
                    className="text-red-300 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select
              id="country"
              defaultOption={t("form.placeholders.country")}
              label={t("form.labels.country")}
              options={countries.map((c) => ({ value: c.isoCode, label: c.name }))}
              register={register}
              onChange={(val) => {
                field.onChange(val);
                setValue("state", ""); 
                setValue("city", "");
              }}
              error={errors.country}
              disabled={false}
            />
          )}
        />

        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <Select
              id="state"
              defaultOption={t("form.placeholders.state")}
              label={t("form.labels.state")}
              options={states.map((s) => ({
                value: s.isoCode,
                label: cleanStateName(s.name) || "",
              }))}
              register={register}
              onChange={(val) => {
                field.onChange(val);
                setValue("city", "");
              }}
              error={errors.state}
              disabled={!countryIso}
            />
          )}
      />

      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <Select
            id="city"
            defaultOption={t("form.placeholders.city")}
            label={t("form.labels.city")}
            options={cities.map((c) => ({ value: c.name, label: c.name }))}
            register={register}
            onChange={field.onChange}
            error={errors.city}
            disabled={!stateIso}   
          />
        )}
      />

        {/* action button */}
        <div className="sm:col-span-2 flex justify-center gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("form.buttons.saving") : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GroupForm;
