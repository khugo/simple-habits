import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Home } from "./pages/Home.tsx";
import Auth from "./pages/Auth";
import { PageLayout } from "./components/PageLayout";
import { GlobalStateProvider } from "./contexts/GlobalState.tsx";

function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as any);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as any);
    });
  }, []);

  const page = getPage();
  return (
    <GlobalStateProvider userId={session?.user?.id}>
      <PageLayout isLoggedIn={!!session}>{page}</PageLayout>
    </GlobalStateProvider>
  );

  function getPage() {
    if (session === undefined) {
      return <div>Loading...</div>;
    }
    if (session === null) {
      return <Auth />;
    }
    return <Home />;
  }
}

export default App;
