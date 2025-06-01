import { useTranslation } from "react-i18next"

function ReplyForm({onChange, onSubmit, onCancel, value}) {
  const { t } = useTranslation("comments");

  return (
    <div className="flex-1 mt-2 w-full place-items-end">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-100 dark:bg-zinc-700 p-3 rounded-lg shadow-sm w-150"
        rows={2}
        placeholder={t("card.placeholder")}
      />
      <div className="flex gap-2 mt-2">
        {/* send the reply */}
        <button
          onClick={onSubmit}
          className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded text-sm"
        >
          {t("card.buttons.reply")}
        </button>

        {/* cancel the reply */}
        <button
          onClick={() => onCancel()}
          className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
        >
          {t("card.buttons.cancel")}
        </button>
      </div>
    </div>
  )
}

export default ReplyForm