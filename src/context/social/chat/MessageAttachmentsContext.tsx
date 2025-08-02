import { createContext, useContext, ReactNode } from "react";
import {
  useFetchMessageAttachmentsQuery,
  useInsertMessageAttachmentMutation,
  useUpdateMessageAttachmentMutation,
  useDeleteMessageAttachmentMutation,
} from "./messageAttachmentsActions";
import {
  MessageAttachment,
  UpdateMessageAttachmentParams,
  DeleteMessageAttachmentParams,
} from "./messageAttachmentsActions";
import { UseQueryResult } from "@tanstack/react-query";

interface MessageAttachmentsContextValue {
  fetchMessageAttachments: (messageId: string) => UseQueryResult<MessageAttachment[], Error>;
  insertMessageAttachment: (attachment: Partial<MessageAttachment>) => Promise<MessageAttachment>;
  updateMessageAttachment: (params: UpdateMessageAttachmentParams) => Promise<MessageAttachment>;
  deleteMessageAttachment: (params: DeleteMessageAttachmentParams) => Promise<void>;
}

const MessageAttachmentsContext = createContext<MessageAttachmentsContextValue | undefined>(undefined);
MessageAttachmentsContext.displayName = "MessageAttachmentsContext";

export const MessageAttachmentsProvider = ({ children }: { children: ReactNode }) => {
  const insertMessageAttachment = useInsertMessageAttachmentMutation().mutateAsync;
  const updateMessageAttachment = useUpdateMessageAttachmentMutation().mutateAsync;
  const deleteMessageAttachment = useDeleteMessageAttachmentMutation().mutateAsync;

  const value: MessageAttachmentsContextValue = {
    fetchMessageAttachments: useFetchMessageAttachmentsQuery,
    insertMessageAttachment,
    updateMessageAttachment,
    deleteMessageAttachment,
  };

  return (
    <MessageAttachmentsContext.Provider value={value}>
      {children}
    </MessageAttachmentsContext.Provider>
  );
};

export const useMessageAttachments = (): MessageAttachmentsContextValue => {
  const context = useContext(MessageAttachmentsContext);
  if (!context) {
    throw new Error("useMessageAttachments must be used within a MessageAttachmentsProvider");
  }
  return context;
};
