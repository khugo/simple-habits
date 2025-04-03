import { ActiveDate } from "./ActiveDate";
import { signOutFromGoogle } from "../googleClient";

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
      className="mt-auto mb-4 py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors self-center"
      onClick={() => {
        signOutFromGoogle();
        window.location.reload(); // Reload to update auth state
      }}
    >
      Logout
    </button>
  );
};
