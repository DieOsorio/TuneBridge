interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  cancelLabel: string;
  color?: "error" | "primary";
  className?: string;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  color = "primary",
  className = "",
}: ConfirmDialogProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className={`text-lg text-center font-bold mb-2 ${color === "error" ? "text-rose-600" : "text-sky-600"}`}>{title}</h2>
        <p className="mb-4 text-center text-gray-700 dark:text-gray-300">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            className={`px-4 py-2 cursor-pointer rounded font-semibold w-32 ${color === "error" ? "bg-rose-700 text-white" : "bg-sky-600 text-white"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            className="px-4 py-2 cursor-pointer rounded font-semibold w-32 bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
