import { useState } from "react";
import { useAdminFeedback } from "@/context/admin/AdminFeedbackContext";

import FeedbackList from "./FeedbackList";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import FeedbackForm from "./FeedbackForm";
import Modal from "@/components/ui/Modal";

interface FeedbackSectionProps {
  isAdmin: boolean,
  isModerator: boolean
}

const FeedbackSection = ({
  isAdmin,
  isModerator,
}: FeedbackSectionProps) => {
  const { t } = useTranslation("admin", {keyPrefix: "feedback.section" });
  const { allFeedbacks, updateUserFeedback, deleteUserFeedback } = useAdminFeedback();

  const { data: feedbacks = [], isLoading, error, refetch } = allFeedbacks();

  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);

  const openReplyModal = (id: string) => setSelectedFeedbackId(id);
  const closeReplyModal = () => setSelectedFeedbackId(null);

  const hasAccess = isAdmin || isModerator;

  const handleUpdateFeedback = async (updatedFeedback: Partial<typeof feedbacks[number]>) => {
    if (!updatedFeedback.id) return;
    try {
      await updateUserFeedback(updatedFeedback);
      await refetch();
      closeReplyModal();
    } catch (error) {
      console.error("Failed to update feedback:", error);
    }
  };

  const handleDeleteFeedback = async (id: string, profile_id: string) => {
    try {
      await deleteUserFeedback({ id, profile_id });
      await refetch();
      if (selectedFeedbackId === id) closeReplyModal();
    } catch (error) {
      console.error("Failed to delete feedback:", error);
    }
  };

  return (
    <section className="p-4 space-y-4">
      <header className="flex p-4 rounded-l-md justify-between items-center space-x-2 bg-gradient-to-r from-gray-800">
        <h2 className="text-xl font-semibold">
          {t("title")}
        </h2>
        <Button onClick={() => refetch()}>
          {t("buttons.refresh")}
        </Button>
      </header>

      <FeedbackList
        feedbacks={feedbacks}
        onReply={openReplyModal}
        onDelete={handleDeleteFeedback}
        isLoading={isLoading}
        error={error}
        hasAccess={hasAccess}
      />

      {selectedFeedbackId && hasAccess && (
        <Modal onClose={closeReplyModal}>
          <FeedbackForm
          feedback={feedbacks.find((f) => f.id === selectedFeedbackId)!}
          onClose={closeReplyModal}
          onUpdate={handleUpdateFeedback}
        />
        </Modal>
      )}
    </section>
  );
};

export default FeedbackSection;
