import { useTranslation } from "react-i18next";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Attachment {
  id: string;
  url: string;
  mime_type: string | null;
  message_id: string | null;
  profile_id: string | null;
  created_at: string;
}

interface ConversationAttachmentsProps {
  attachments: Attachment[];
  onClose: () => void;
}

const ConversationAttachments = ({ attachments, onClose }: ConversationAttachmentsProps) => {
  const { t } = useTranslation("chat", { keyPrefix: "header" });

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
      <div className="bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-4 z-50 overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl m-auto font-semibold text-white">{t("buttons.attachments")}</h2>
          <button onClick={onClose} className="text-white hover:text-red-400 cursor-pointer">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {attachments.length === 0 ? (
          <p className="text-gray-400">{t("buttons.noAttachments")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 rounded p-2 hover:bg-gray-700 transition"
              >
                {att.mime_type?.startsWith("image/") ? (
                  <img
                    src={att.url}
                    alt="Attachment"
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <div className="text-white text-sm break-all">{att.url.split("/").pop()}</div>
                )}
                <div className="text-gray-400 text-xs mt-1">
                  {new Date(att.created_at).toLocaleString()}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default ConversationAttachments;
