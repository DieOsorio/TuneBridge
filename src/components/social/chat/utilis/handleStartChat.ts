import { NavigateFunction } from "react-router-dom";
import type { Conversation } from "../../../../context/social/chat/conversationsActions";
import type { Participant } from "../../../../context/social/chat/participantsActions";
import type { Profile } from "../../../../context/profile/profileActions";

interface StartChatParams {
  myProfileId: string;
  otherProfile: Profile;
  findConversation: (params: {
    myProfileId: string;
    otherProfileId: string;
    all?: boolean;
  }) => Promise<Conversation[] | Conversation | null>;
  createConversation: (conversation: Partial<Conversation>) => Promise<Conversation>;
  addParticipant: (params: {
    conversation_id: string;
    profile_id: string;
  }) => Promise<Participant>;
  navigate: NavigateFunction;
  setLoading?: (loading: boolean) => void;
}

export const handleStartChat = async ({
  myProfileId,
  otherProfile,
  findConversation,
  createConversation,
  addParticipant,
  navigate,
  setLoading = () => {},
}: StartChatParams): Promise<void> => {
  try {
    setLoading(true);

    const allConversations = await findConversation({
      myProfileId,
      otherProfileId: otherProfile.id,
      all: true,
    });

    let oneOnOne: Conversation | null = null;
    let group: Conversation | null = null;

    if (Array.isArray(allConversations)) {
      oneOnOne = allConversations.find((c) => !c.is_group) ?? null;
      group = allConversations.find((c) => c.is_group) ?? null;
    } else if (allConversations && typeof allConversations === "object") {
      if (allConversations.is_group) group = allConversations;
      else oneOnOne = allConversations;
    }

    if (oneOnOne) {
      navigate(`/chat/${oneOnOne.id}`);
      return;
    }

    if (group) {
      navigate(`/chat/${group.id}`);
      return;
    }

    const newConv = await createConversation({
      created_by: myProfileId,
      avatar_url: otherProfile.avatar_url ?? undefined,
      title: otherProfile.username ?? "",
    });

    await addParticipant({ conversation_id: newConv.id, profile_id: myProfileId });
    await addParticipant({ conversation_id: newConv.id, profile_id: otherProfile.id });

    navigate(`/chat/${newConv.id}`);
  } catch (err) {
    console.error("Error starting conversation:", err);
  } finally {
    setLoading(false);
  }
};
