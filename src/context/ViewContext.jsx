import { createContext, useContext, useState } from "react";

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [internView, setInterView] = useState(null);

  return (
    <ViewContext.Provider value={{ selectedOption, internView, setSelectedOption, setInterView }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => useContext(ViewContext);
