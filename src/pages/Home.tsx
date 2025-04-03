import { useState, useEffect } from "react";
import _ from "lodash";
import { MoodRating } from "../components/MoodRating.tsx";
import {
  testSheetsConnection,
  getOrCreateSimpleHabitsSpreadsheet,
} from "../googleClient";
import { Habit } from "../components/Habit";
import { useHabits } from "../hooks/useHabits";

export function Home() {
  const [testSpreadsheet, setTestSpreadsheet] = useState<any>(null);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [habitsSpreadsheet, setHabitsSpreadsheet] = useState<any>(null);
  const [isLoadingSpreadsheet, setIsLoadingSpreadsheet] = useState(false);

  // Use the custom hook to get habits
  const {
    habits,
    isLoading: habitsLoading,
    error: habitsError,
    refresh: refreshHabits,
    addHabit,
    updateHabit,
    archiveHabit,
  } = useHabits();

  // State for adding new habits
  const [newHabitName, setNewHabitName] = useState("");
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  useEffect(() => {
    void initSimpleHabitsSpreadsheet();
  }, []);

  // Find or create the Simple Habits spreadsheet
  async function initSimpleHabitsSpreadsheet() {
    setIsLoadingSpreadsheet(true);
    setSheetsError(null);
    try {
      const spreadsheet = await getOrCreateSimpleHabitsSpreadsheet();
      setHabitsSpreadsheet(spreadsheet);
      console.log("Simple Habits spreadsheet:", spreadsheet);

      // Once spreadsheet is initialized, refresh habits
      await refreshHabits();
    } catch (error: any) {
      console.error("Error initializing spreadsheet:", error);
      setSheetsError(error.message || "Failed to initialize spreadsheet");
    } finally {
      setIsLoadingSpreadsheet(false);
    }
  }

  async function testGoogleConnection() {
    setSheetsLoading(true);
    setSheetsError(null);
    try {
      const result = await testSheetsConnection();
      setTestSpreadsheet(result);
      console.log("Test spreadsheet created:", result);
    } catch (error: any) {
      console.error("Error testing Google Sheets connection:", error);
      setSheetsError(error.message || "Failed to connect to Google Sheets");
    } finally {
      setSheetsLoading(false);
    }
  }

  // Handle adding a new habit
  async function handleAddHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    setIsAddingHabit(true);

    try {
      await addHabit(newHabitName.trim());
      setNewHabitName("");
    } catch (error) {
      console.error("Error adding habit:", error);
    } finally {
      setIsAddingHabit(false);
    }
  }

  const sortedHabits = _.orderBy(
    habits,
    ["archived_at", "created_at"],
    ["desc", "desc"],
  );

  const activeHabits = sortedHabits.filter((habit) => !habit.archived_at);
  const archivedHabits = sortedHabits.filter((habit) => habit.archived_at);

  return (
    <div className="grid flex-col space-y-4 pb-2 justify-center min-w-[768px] mx-auto">
      {/* Mood Rating */}
      <MoodRating />

      {/* Habits list */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-xl font-bold mb-3">Your Habits</h2>

        {habitsLoading ? (
          <p className="text-gray-600">Loading habits...</p>
        ) : habitsError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Error loading habits:</p>
            <p>{habitsError}</p>
            <button
              onClick={() => refreshHabits()}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Retry
            </button>
          </div>
        ) : activeHabits.length === 0 ? (
          <p className="text-gray-600">
            You don't have any active habits yet. Add your first habit below!
          </p>
        ) : (
          <div className="space-y-6">
            {activeHabits.map((habit) => (
              <div key={habit.id} className="border-b pb-4">
                <Habit habit={habit} />
                <button
                  onClick={() => archiveHabit(habit.id)}
                  className="mt-2 text-sm text-gray-500 hover:text-red-600"
                >
                  Archive
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archived Habits */}
      {archivedHabits.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-3">Archived Habits</h2>
          <div className="space-y-6">
            {archivedHabits.map((habit) => (
              <div key={habit.id} className="border-b pb-4 opacity-70">
                <Habit habit={habit} />
                <button
                  onClick={() => updateHabit(habit.id, { archived_at: null })}
                  className="mt-2 text-sm text-gray-500 hover:text-green-600"
                >
                  Unarchive
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new habit form */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-xl font-bold mb-3">Add New Habit</h2>
        <form onSubmit={handleAddHabit} className="flex items-end space-x-2">
          <div className="flex-grow">
            <label
              htmlFor="habitName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Habit Name
            </label>
            <input
              type="text"
              id="habitName"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter a new habit..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isAddingHabit}
            />
          </div>
          <button
            type="submit"
            disabled={isAddingHabit || !newHabitName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isAddingHabit ? "Adding..." : "Add Habit"}
          </button>
        </form>
      </div>

      {/* Google Sheets Status */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-xl font-bold mb-2">Google Sheets Integration</h2>

        {/* Simple Habits Spreadsheet Status */}
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-2">Database Status</h3>
          {isLoadingSpreadsheet ? (
            <p className="text-gray-600">Initializing spreadsheet...</p>
          ) : sheetsError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Error:</p>
              <p>{sheetsError}</p>
              <button
                onClick={initSimpleHabitsSpreadsheet}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Retry
              </button>
            </div>
          ) : habitsSpreadsheet ? (
            <div className="bg-green-100 p-3 rounded text-green-800">
              <p className="font-medium">
                {habitsSpreadsheet.isNew ? (
                  "✓ New 'Simple Habits' spreadsheet created!"
                ) : (
                  <span>✓ Using existing 'Simple Habits' spreadsheet</span>
                )}
              </p>
              <p className="text-sm mt-1">
                Spreadsheet ID:{" "}
                {habitsSpreadsheet.spreadsheetUrl ? (
                  <a
                    href={habitsSpreadsheet.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {habitsSpreadsheet.spreadsheetId}
                  </a>
                ) : (
                  habitsSpreadsheet.spreadsheetId
                )}
              </p>
              {habitsSpreadsheet.isNew && habitsSpreadsheet.spreadsheetUrl && (
                <a
                  href={habitsSpreadsheet.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm block mt-1"
                >
                  Open in Google Sheets
                </a>
              )}
            </div>
          ) : (
            <p className="text-yellow-600">
              Simple Habits spreadsheet not initialized.
            </p>
          )}
        </div>

        {/* Test connection section (hidden by default) */}
        {sheetsError && (
          <div className="mb-2">
            <h3 className="text-lg font-medium mb-2">Test Connection</h3>
            {sheetsLoading ? (
              <p className="text-gray-600">
                Testing connection to Google Sheets...
              </p>
            ) : testSpreadsheet ? (
              <div>
                <p className="text-green-600 font-medium mb-2">
                  Connection successful!
                </p>
                <p className="mb-2">Created test spreadsheet:</p>
                <div className="bg-gray-100 p-3 rounded">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {testSpreadsheet.name}
                  </p>
                  <p>
                    <span className="font-medium">ID:</span>{" "}
                    {testSpreadsheet.spreadsheetId}
                  </p>
                  <p>
                    <a
                      href={testSpreadsheet.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Open spreadsheet
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                You can test the connection to Google Sheets by creating a test
                spreadsheet.
              </p>
            )}
            <button
              onClick={testGoogleConnection}
              disabled={sheetsLoading}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {sheetsLoading ? "Testing..." : "Test Connection"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
