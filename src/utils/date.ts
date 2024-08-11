import { endOfDay, subDays } from "date-fns";

// Consider early mornings of dates to still be the previous date
export const getDefaultDate = () => {
  const now = new Date();
  if (now.getHours() >= 0 && now.getHours() < 5) {
    return endOfDay(subDays(now, 1));
  }
  return endOfDay(now);
};
