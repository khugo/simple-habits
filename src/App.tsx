import { useState, useEffect } from "react";
import { Home } from "./pages/Home.tsx";
import Auth from "./pages/Auth";
import { PageLayout } from "./components/PageLayout";
import { GlobalStateProvider } from "./contexts/GlobalState.tsx";
import { isAuthenticated, getCurrentUser, initGoogleAPI } from "./googleClient";

function App() {
  const [session, setSession] = useState<any>(undefined);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initGoogleAPI();

        if (isAuthenticated()) {
          const user = getCurrentUser();
          setSession({ user });
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Error initializing auth", error);
        setSession(null);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();

    // Listen for storage events (for token changes)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "google_access_token") {
        if (event.newValue) {
          const user = getCurrentUser();
          setSession({ user });
        } else {
          setSession(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const page = getPage();
  return (
    <GlobalStateProvider userId={session?.user?.id}>
      <PageLayout isLoggedIn={!!session}>{page}</PageLayout>
    </GlobalStateProvider>
  );

  function getPage() {
    if (!initialized) {
      return <div>Loading...</div>;
    }
    if (session === null) {
      return <Auth />;
    }
    return <Home />;
  }
}

export default App;
