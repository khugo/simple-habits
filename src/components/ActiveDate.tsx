import { addDays, endOfDay, format, subDays } from "date-fns";

import { useActiveDate } from "../utils/date";

export const ActiveDate = () => {
  const { activeDate, setActiveDate } = useActiveDate();
  const isToday = endOfDay(new Date(activeDate)) >= endOfDay(new Date());

  const changeDate = (operation: "back" | "forward") => {
    if (operation === "back") {
      setActiveDate(subDays(new Date(activeDate), 1).toISOString());
    }
    if (operation === "forward" && !isToday) {
      setActiveDate(addDays(new Date(activeDate), 1).toISOString());
    }
  };

  return (
    <div className="flex">
      <div className="mx-auto flex flex-row">
        <span className="font-bold" onClick={() => changeDate("back")}>
          {"<"}
        </span>
        <p className="mx-2">{format(new Date(activeDate), "E do, LLL")}</p>
        {!isToday && (
          <span className="font-bold" onClick={() => changeDate("forward")}>
            {">"}
          </span>
        )}
      </div>
    </div>
  );
};
