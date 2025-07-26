import { memo, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface EditCommentBoxProps {
  value: string;
  onChange: (newValue: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditCommentBox({ value, onChange, onSave, onCancel }: EditCommentBoxProps) {
  const { t } = useTranslation("common");

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex-1 mt-2 place-items-end">
      <textarea
        value={value}
        onChange={handleChange}
        className="w-100 p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 resize-none"
        rows={2}
      />
      <div className="flex gap-2 mt-2 justify-center">
        <button
          onClick={onSave}
          className="px-3 py-1 w-18 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm"
        >
          {t("generic.save")}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 w-18 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
        >
          {t("generic.cancel")}
        </button>
      </div>
    </div>
  );
}

export default memo(EditCommentBox);
