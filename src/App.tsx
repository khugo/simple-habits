import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { HabitList } from "./pages/HabitList";
import Auth from "./pages/Auth";
import { PageLayout } from "./components/PageLayout";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const page = getPage();
  return <PageLayout>{page}</PageLayout>;

  function getPage() {
    const pathname = window.location.pathname;
    if (pathname === "/auth") {
      return <Auth />;
    }
    if (!session) {
      return <div>No session. Please log in.</div>;
    }
    return <HabitList />;
  }
}

export default App;
