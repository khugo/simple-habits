import { addDays, endOfDay, format, subDays } from "date-fns";
import { useGlobalState } from "../contexts/GlobalState.tsx";

export const ActiveDate = () => {
  const {
    state: { selectedDate },
    updateSelectedDate,
  } = useGlobalState();
  const isToday = endOfDay(new Date(selectedDate)) >= endOfDay(new Date());

  const changeDate = (operation: "back" | "forward") => {
    if (operation === "back") {
      updateSelectedDate(subDays(new Date(selectedDate), 1));
    }
    if (operation === "forward" && !isToday) {
      updateSelectedDate(addDays(new Date(selectedDate), 1));
    }
  };

  return (
    <div className="flex">
      <div className="mx-auto flex flex-row">
        <span className="font-bold" onClick={() => changeDate("back")}>
          {"<"}
        </span>
        <p className="mx-2 w-[115px] text-center">
          {format(new Date(selectedDate), "E do, LLL")}
        </p>
        {!isToday && (
          <span className="font-bold" onClick={() => changeDate("forward")}>
            {">"}
          </span>
        )}
      </div>
    </div>
  );
};
