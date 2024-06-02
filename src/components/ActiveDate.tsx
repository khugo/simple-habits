import { addDays, endOfDay, format, getDate, subDays } from "date-fns";

import { useUrlState } from "../utils/url";
import { getActiveDate } from "../utils/date";

export const ActiveDate = () => {
  const { queryParam: activeDate, setQueryParam: setActiveDate } = useUrlState(
    "date",
    getActiveDate().toISOString(),
  );
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
