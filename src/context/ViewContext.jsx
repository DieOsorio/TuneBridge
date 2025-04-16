import { createContext, useContext, useState } from "react";

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
  const [externalView, setExternalView] = useState(null);
  const [internalView, setInternalView] = useState(null);

  const manageView = (internal, external) => {
    setExternalView(external);
    setInternalView(internal);
  }

  return (
    <ViewContext.Provider value={{ externalView, internalView, manageView, setExternalView, setInternalView }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => useContext(ViewContext);
