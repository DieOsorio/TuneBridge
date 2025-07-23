import { createContext, useContext, ReactNode } from "react";
import {
  useFetchParticipantsQuery,
  useAddParticipantMutation,
  useUpdateParticipantRoleMutation,
  useRemoveParticipantMutation,
} from "./participantsActions";
import { Participant, AddParticipantParams, UpdateParticipantRoleParams, RemoveParticipantParams } from "./participantsActions";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

interface ParticipantsContextValue {
  fetchParticipants: (conversationId: string) => UseQueryResult<Participant[], Error>;
  addParticipant: (params: AddParticipantParams) => Promise<Participant>;
  updateParticipantRole: (params: UpdateParticipantRoleParams) => Promise<Participant>;
  removeParticipant: (params: RemoveParticipantParams) => Promise<void>;
}

const ParticipantsContext = createContext<ParticipantsContextValue | undefined>(undefined);
ParticipantsContext.displayName = "ParticipantsContext";

export const ParticipantsProvider = ({ children }: { children: ReactNode }) => {
  const addParticipant = useAddParticipantMutation().mutateAsync;
  const removeParticipant = useRemoveParticipantMutation().mutateAsync;
  const updateParticipantRole = useUpdateParticipantRoleMutation().mutateAsync;

  const value: ParticipantsContextValue = {
    fetchParticipants: useFetchParticipantsQuery,
    addParticipant,
    updateParticipantRole,
    removeParticipant,
  };

  return (
    <ParticipantsContext.Provider value={value}>
      {children}
    </ParticipantsContext.Provider>
  );
};

export const useParticipants = (): ParticipantsContextValue => {
  const context = useContext(ParticipantsContext);
  if (!context) {
    throw new Error("useParticipants must be used within a ParticipantsProvider");
  }
  return context;
};
