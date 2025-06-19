export const handleStartChat = async ({
  myProfileId,
  otherProfile,
  findConversation,
  createConversation,
  addParticipant,
  navigate,
  setLoading = () => {},
}) => {
  try {
    setLoading(true);

    // Buscar conversación existente
    const allConversations = await findConversation({
      myProfileId,
      otherProfileId: otherProfile.id,
      all: true,
    });

    let oneOnOne = null;
    let group = null;

    if (Array.isArray(allConversations)) {
      oneOnOne = allConversations.find((c) => !c.is_group);
      group = allConversations.find((c) => c.is_group);
    } else if (allConversations && typeof allConversations === "object") {
      if (allConversations.is_group) group = allConversations;
      else oneOnOne = allConversations;
    }

    if (oneOnOne) {
      // Redirigir a la conversación individual existente
      navigate(`/chat/${oneOnOne.id}`);
      return;
    }

    if (group) {
      // Redirigir a la conversación grupal si existe
      navigate(`/chat/${group.id}`);
      return;
    }

    // Crear nueva conversación 1-a-1
    const newConv = await createConversation({
      created_by: myProfileId,
      avatar_url: otherProfile.avatar_url,
      title: otherProfile.username,
    });

    await addParticipant({ conversation_id: newConv.id, profile_id: myProfileId });
    await addParticipant({ conversation_id: newConv.id, profile_id: otherProfile.id });

    navigate(`/chat/${newConv.id}`);
  } catch (err) {
    console.error("Error iniciando conversación:", err);
  } finally {
    setLoading(false);
  }
};
