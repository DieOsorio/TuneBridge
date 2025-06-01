import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchParticipantsQuery,
  useAddParticipantMutation,
  useUpdateParticipantRoleMutation,
  useRemoveParticipantMutation,
} from "./participantsActions";

const ParticipantsContext = createContext();
ParticipantsContext.displayName = "ParticipantsContext";

export const ParticipantsProvider = ({ children }) => {
  const addParticipant = useAddParticipantMutation().mutateAsync;
  const removeParticipant = useRemoveParticipantMutation().mutateAsync;
  const updateParticipantRole = useUpdateParticipantRoleMutation().mutateAsync;

  const value = {
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

ParticipantsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useParticipants = () => {
  const context = useContext(ParticipantsContext);
  if (!context) {
    throw new Error("useParticipants must be used within a ParticipantsProvider");
  }
  return context;
};
