import { createContext, useState, useContext } from "react";
import { getDefaultDate } from "../utils/date.ts";

type GlobalState = {
  state: {
    selectedDate: Date;
    userId?: string;
  };
  updateSelectedDate: (newDate: Date) => void;
};

const GlobalStateContext = createContext<GlobalState | null>(null);

export const GlobalStateProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) => {
  const [state, setState] = useState<GlobalState["state"]>({
    selectedDate: getDefaultDate(),
    userId,
  });

  if (userId !== state.userId) {
    setState({ ...state, userId: userId });
  }

  const updateSelectedDate = (newDate: Date) => {
    setState({ ...state, selectedDate: newDate });
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
