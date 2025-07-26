import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useGroupEvents } from "@/context/groups/GroupEventsContext";
import type { GroupEvent } from "@/context/groups/groupEventsActions";
import { useAuth } from "@/context/AuthContext";

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/en";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

type FormValues = {
  title: string;
  type: "rehearsal" | "gig" | "meeting";
  start_time: Dayjs | null;
  end_time: Dayjs | null;
  location: string;
  description: string;
};

type Props = {
  groupId: string;
  onClose: () => void;
  initialEvent?: Partial<GroupEvent> | null;
  mode?: "create" | "edit";
};

const defaultValues: FormValues = {
  title: "",
  type: "rehearsal",
  start_time: null,
  end_time: null,
  location: "",
  description: "",
};

const GroupEventFormModal = ({
  groupId,
  onClose,
  initialEvent = null,
  mode = "create",
}: Props) => {
  const { user } = useAuth();
  const isEdit = mode === "edit";
  const { t, i18n } = useTranslation("groupEvents", { keyPrefix: "form" });
  const currentLocale = i18n.language === "es" ? "es" : "en";

  const { createEvent, updateEvent } = useGroupEvents();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues });

  const watchStart = watch("start_time");
  const watchEnd = watch("end_time");

  useEffect(() => {
    if (initialEvent) {
      reset({
        title: initialEvent.title || "",
        type: (initialEvent.type as FormValues["type"]) || "rehearsal",
        start_time: dayjs(initialEvent.start_time),
        end_time: dayjs(initialEvent.end_time),
        location: initialEvent.location || "",
        description: initialEvent.description || "",
      });
    } else {
      reset(defaultValues);
    }
  }, [initialEvent, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        start_time: data.start_time?.toISOString(),
        end_time: data.end_time?.toISOString(),
        created_by: user!.id,
      };
      if (isEdit && initialEvent?.id) {
        await updateEvent({
          eventId: initialEvent.id,
          updates: payload,
        });
      } else {
        await createEvent({ 
          profile_group_id: groupId, 
          ...payload 
        });
      }
      onClose();
    } catch (error) {
      alert(t("error_saving_event"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-full overflow-y-auto p-8 text-gray-900 relative"
        style={{ minHeight: "400px" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
          aria-label={t("close")}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl text-yellow-600 font-semibold mb-6 text-center">
          {isEdit ? t("titles.edit_event") : t("titles.create_event")}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="title"
            label={t("labels.title")}
            maxLength={12}
            placeholder={t("placeholders.title")}
            register={register}
            validation={{ required: t("validations.title") }}
            error={errors.title?.message}
            className="text-gray-900"
            classForLabel="!text-gray-700"
          />

          <Select
            id="type"
            label={t("labels.type")}
            defaultOption={t("placeholders.type")}
            options={[
              { value: "rehearsal", label: t("types.rehearsal") },
              { value: "gig", label: t("types.gig") },
              { value: "meeting", label: t("types.meeting") },
            ]}
            register={register}
            error={errors.type?.message}
            className="bg-white text-gray-900 placeholder-gray-400 focus:bg-white focus:text-gray-900"
            classForLabel="!text-gray-700"
          />

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={currentLocale}>
            <div className="space-y-6">
              <div className="custom-datetime">
                <label htmlFor="start_time" className="block text-sm font-bold mb-2 text-gray-700">
                  {t("labels.start_time")}
                </label>
                <DateTimePicker
                  className="MuiCustomDateTimePicker"
                  value={watchStart}
                  onChange={(value, _context) => {
                    if (value === null || dayjs.isDayjs(value)) {
                      setValue("start_time", value);
                    }
                  }}
                  slotProps={{
                    textField: {
                      id: "start_time",
                      fullWidth: true,
                      error: !!errors.start_time,
                      helperText: errors.start_time?.message,
                      size: "small",
                      variant: "outlined",
                    },
                  }}
                />
              </div>

              <div className="custom-datetime">
                <label htmlFor="end_time" className="block text-sm font-bold mb-2 text-gray-700">
                  {t("labels.end_time")}
                </label>
                <DateTimePicker
                  className="MuiCustomDateTimePicker"
                  value={watchEnd}
                  onChange={(value, _context) => {
                    if (value === null || dayjs.isDayjs(value)) {
                      setValue("end_time", value);
                    }
                  }}
                  slotProps={{
                    textField: {
                      id: "end_time",
                      fullWidth: true,
                      error: !!errors.end_time,
                      helperText: errors.end_time?.message,
                      size: "small",
                      variant: "outlined",
                    },
                  }}
                />
              </div>
            </div>
          </LocalizationProvider>

          <Input
            id="location"
            label={t("labels.location")}
            placeholder={t("placeholders.location")}
            register={register}
            error={errors.location?.message}
            className="text-gray-900"
            classForLabel="!text-gray-700"
          />

          <Textarea
            id="description"
            label={t("labels.description")}
            placeholder={t("placeholders.description")}
            maxLength={200}
            register={register}
            error={errors.description}
            watchValue={""}
            className="text-gray-900"
            classForLabel="!text-gray-700"
          />

          <div className="pt-4 flex justify-end space-x-4">
            <Button
              className="!bg-gray-600 hover:!bg-gray-700 text-white"
              type="button"
              onClick={onClose}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="!bg-emerald-600 hover:!bg-emerald-700 text-white"
            >
              {isSubmitting
                ? t("buttons.saving")
                : isEdit
                  ? t("buttons.save")
                  : t("buttons.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupEventFormModal;
