// Types for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
          hasGrantedAllScopes: (token: string, ...scopes: string[]) => boolean;
        };
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: any) => void;
        };
      };
    };
  }
}

let tokenClient: any = null;
// Add drive.readonly scope to allow finding existing spreadsheets
const SCOPES =
  "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly";

// Initialize Google Identity Services
export const initGoogleAPI = async () => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Load the Google Identity Services script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize the token client
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: () => { }, // We'll handle this in signInWithGoogle
        });
        resolve();
      };
      script.onerror = () => {
        reject(new Error("Failed to load Google Identity Services"));
      };
      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
};

// Sign in with Google
export const signInWithGoogle = async () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Google API not initialized"));
      return;
    }

    try {
      tokenClient.callback = async (response: any) => {
        if (response.error) {
          reject(response);
          return;
        }

        // Store access token
        const accessToken = response.access_token;
        localStorage.setItem("google_access_token", accessToken);

        // Instead of fetching user info, we'll just use a simple userId
        // This is sufficient for a personal app
        const userId = "current-user";
        localStorage.setItem("user_id", userId);

        resolve({
          accessToken,
          user: {
            id: userId,
          },
        });
      };

      tokenClient.requestAccessToken({ prompt: "" });
    } catch (error) {
      reject(error);
    }
  });
};

// Sign out from Google
export const signOutFromGoogle = () => {
  // Clear tokens from localStorage
  localStorage.removeItem("google_access_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_id");
  localStorage.removeItem("simple_habits_sheet_id"); // Clear the stored sheet ID
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const accessToken = localStorage.getItem("google_access_token");
  return !!accessToken;
};

// Get current authenticated user
export const getCurrentUser = () => {
  if (!isAuthenticated()) return null;

  return {
    id: localStorage.getItem("user_id") || "current-user",
    email: localStorage.getItem("user_email") || "",
    name: "", // Name is not stored in localStorage in this implementation
  };
};

// Get access token for API calls
export const getAccessToken = () => {
  return localStorage.getItem("google_access_token");
};

// Call Google Sheets API using fetch with access token
export const callGoogleSheetsAPI = async (
  endpoint: string,
  method = "GET",
  body: any = null,
) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/${endpoint}`,
    options,
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Call Google Drive API using fetch with access token
export const callGoogleDriveAPI = async (
  endpoint: string,
  method = "GET",
  body: any = null,
) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/${endpoint}`,
    options,
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Re-export spreadsheet functions from the spreadsheet service
export {
  getOrCreateSimpleHabitsSpreadsheet,
  testSheetsConnection,
} from "./services/spreadsheet";
