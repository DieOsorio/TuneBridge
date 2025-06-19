
// Group Events Keys
export const groupEventsKeyFactory = ({ profileGroupId }) => {
  return {
    root: ["groupEvents"],
    all: ["groupEvents", profileGroupId],
    byId: (eventId) => ["groupEvents", profileGroupId, eventId],
  };
};

// Group Event RSVPs Keys
export const groupEventRsvpsKeyFactory = ({ eventId }) => {
  return {
    root: ["groupEventRsvps"],
    all: ["groupEventRsvps", eventId],
    byId: (profileId) => ["groupEventRsvps", eventId, profileId],
  };
};
