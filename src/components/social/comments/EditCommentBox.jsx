import React, {memo} from 'react';

function EditCommentBox({ value, onChange, onSave, onCancel }) {
  return (
    <div className="flex-1 mt-2 place-items-end">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-100 p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 resize-none"
        rows={2}
      />
      <div className="flex gap-2 mt-2 justify-center">
        <button
          onClick={() => onSave()}
          className="px-3 py-1 w-16 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
        >
          Save
        </button>
        <button
          onClick={() => onCancel()}
          className="px-3 py-1 w-16 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default memo(EditCommentBox);