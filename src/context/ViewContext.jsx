import { createContext, useContext, useState } from "react";

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
  const [externalView, setExternalView] = useState(null);
  const [internalView, setInternalView] = useState(null);

  return (
    <ViewContext.Provider value={{ externalView, internalView, setExternalView, setInternalView }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => useContext(ViewContext);
