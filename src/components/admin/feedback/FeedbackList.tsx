import { useState } from "react";
import { useTranslation } from "react-i18next";

import { TrashIcon } from "@heroicons/react/24/solid";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

import type { UserFeedback } from "@/context/admin/adminFeedbackActions";
import ListSkeleton from "../skeletons/ListSkeleton";
import ErrorMessage from "@/utils/ErrorMessage";

interface FeedbackListProps {
  feedbacks: UserFeedback[];
  onReply: (id: string) => void;
  onDelete: (id: string, profile_id: string) => void;
  isLoading: boolean;
  error: unknown;
  hasAccess: boolean;
}

const FeedbackList = ({ 
  feedbacks,
  isLoading,
  error,
  hasAccess, 
  onReply, 
  onDelete }: FeedbackListProps) => {
    const { t } = useTranslation("admin", { keyPrefix: "feedback.list" });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);

    if (isLoading) {
      return <ListSkeleton count={3}/>
    }

    if (error && error instanceof Error) {
      return <ErrorMessage error={error.message} />;
    }

    if (feedbacks.length === 0) {
      return <p className="text-sm text-muted">{t("empty")}</p>;
    }

    const handleDeleteFeedback = () => {
      if (selectedFeedback) {
        onDelete(selectedFeedback.id, selectedFeedback.profile_id);
        setDialogOpen(false);
        setSelectedFeedback(null);
      }
    };

    return (
      <>
        <ul className="space-y-4">
          {feedbacks.map((feedback) => (
            <li
              key={feedback.id}
                  className={`flex justify-between bg-zinc-700/10 items-center p-3 rounded transition-all 
                    ${hasAccess ? "cursor-pointer hover:bg-zinc-700/20" : "cursor-default"}`}
                  onClick={hasAccess ? () => onReply(feedback.id) : undefined}
                  role={hasAccess ? "button" : undefined}
                  tabIndex={hasAccess ? 0 : -1}
                  onKeyDown={hasAccess ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onReply(feedback.id);
                    }
                  } : undefined}
            >
              <div className="flex-1 flex-grow gap-1">
                <p className="font-semibold uppercase text-white mb-1">{feedback.type}</p>
                <p className="font-semibold text-gray-300 text-sm truncate w-full bg-gray-700 px-2 py-3 rounded-md max-w-169">{feedback.message}</p>
                <div className="flex items-center gap-4 w-full bg-gray-700 p-2 rounded-md max-w-169 mt-1">
                  <p className="uppercase">
                    {t("fields.status")}
                  </p>
                  <span className="text-sm text-gray-300">{feedback.status}</span>
                </div>
              </div>

              {hasAccess && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFeedback(feedback);
                    setDialogOpen(true);
                  }}
                  aria-label={t("deleteAria")}
                  title={t("deleteTitle")}
                  className="p-1 mb-auto text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
        <ConfirmDialog
          isOpen={dialogOpen}
          title={t("danger.title")}
          message={t("danger.confirm")}
          onConfirm={handleDeleteFeedback}
          onCancel={() => {
            setDialogOpen(false);
            setSelectedFeedback(null);
          }}
          confirmLabel={t("danger.yesDelete")}
          cancelLabel={t("danger.cancel")}
          color="error"
        />
      </>
    );
};

export default FeedbackList;
