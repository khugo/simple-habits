import { endOfDay, subDays } from "date-fns";
import { useUrlState } from "./url";

export const useActiveDate = () => {
  const { queryParam: activeDate, setQueryParam: setActiveDate } = useUrlState(
    "date",
    getDefaultDate().toISOString(),
  );
  return {
    activeDate: new Date(activeDate),
    setActiveDate,
  };
};

// Consider early mornings of dates to still be the previous date
const getDefaultDate = () => {
  const now = new Date();
  if (now.getHours() >= 0 && now.getHours() < 5) {
    return endOfDay(subDays(now, 1));
  }
  return endOfDay(now);
};
