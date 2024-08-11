import { createContext, useState, useContext } from "react";
import { getDefaultDate } from "../utils/date.ts";

type GlobalState = {
  state: {
    selectedDate: Date;
  };
  updateSelectedDate: (newDate: Date) => void;
};

const GlobalStateContext = createContext<GlobalState | null>(null);

export const GlobalStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState({ selectedDate: getDefaultDate() });

  const updateSelectedDate = (newDate: Date) => {
    setState({ selectedDate: newDate });
  };

  return (
    <GlobalStateContext.Provider value={{ state, updateSelectedDate }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
