import { supabase } from "../supabaseClient";
import { ActiveDate } from "./ActiveDate";

export const PageLayout = (props: {
  children: React.ReactNode;
  isLoggedIn: boolean;
}) => (
  <div className={"container mx-auto h-screen flex flex-col p-3"}>
    <Header />
    {props.children}
    {props.isLoggedIn && <Logout />}
  </div>
);

const Header = () => {
  return (
    <div className="pb-3 w-full flex flex-col">
      <h1 className="font-sans text-4xl mx-auto">Habitti</h1>
      <ActiveDate />
    </div>
  );
};

const Logout = () => {
  return (
    <button
      onClick={() => {
        supabase.auth.signOut();
      }}
    >
      Logout
    </button>
  );
};
