import React, { useEffect, useState } from "react";
import { initGoogleAPI, signInWithGoogle } from "../googleClient";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [apiInitialized, setApiInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAPI = async () => {
      try {
        await initGoogleAPI();
        setApiInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Google API", error);
        setError("Failed to initialize Google API. Please try again.");
      }
    };

    initAPI();
  }, []);

  const handleGoogleLogin = async () => {
    if (!apiInitialized) {
      setError(
        "Google API is not initialized yet. Please try again in a moment.",
      );
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // The App component will handle the session change through storage event
      window.location.reload(); // Reload to ensure state is updated
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      if (error.error === "popup_closed_by_user") {
        setError("Login was canceled. Please try again.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Simple Habits</h1>
        <p className="text-gray-600 mb-6 text-center">
          Sign in with your Google account to track your habits
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading || !apiInitialized}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <span>Loading...</span>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <div className="mt-4 text-xs text-center text-gray-500">
          <p>Note: This app only requests access to Google Sheets</p>
          <p>No other data from your Google account will be accessed</p>
        </div>
      </div>
    </div>
  );
}
