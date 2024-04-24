import { format } from "date-fns";
import { getActiveDate } from "../utils/date";

export const PageLayout = (props: { children: React.ReactNode }) => (
  <div className={"container mx-auto h-screen flex flex-col p-4"}>
    <Header />
    {props.children}
  </div>
);

const Header = () => {
  return (
    <div className="pb-3 w-full flex flex-col">
      <h1 className="font-sans text-4xl mx-auto">Simple Habits</h1>
      <p className="mx-auto">{format(getActiveDate(), "E do, LLL")}</p>
    </div>
  );
};
