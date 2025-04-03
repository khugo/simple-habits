import { callGoogleSheetsAPI } from "../googleClient";

/**
 * Creates a new Simple Habits spreadsheet with the required structure
 */
export const createSimpleHabitsSpreadsheet = async () => {
  try {
    const body = {
      properties: {
        title: "Simple Habits",
      },
      sheets: [
        // Habits sheet
        {
          properties: {
            title: "habits",
            gridProperties: {
              rowCount: 1000,
              columnCount: 4,
              frozenRowCount: 1,
            },
          },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "id" } },
                    { userEnteredValue: { stringValue: "name" } },
                    { userEnteredValue: { stringValue: "created_at" } },
                    { userEnteredValue: { stringValue: "archived_at" } },
                  ],
                },
              ],
            },
          ],
        },
        // Habits entries sheet
        {
          properties: {
            title: "habits_entries",
            gridProperties: {
              rowCount: 5000,
              columnCount: 3,
              frozenRowCount: 1,
            },
          },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "id" } },
                    { userEnteredValue: { stringValue: "habit_id" } },
                    { userEnteredValue: { stringValue: "timestamp" } },
                  ],
                },
              ],
            },
          ],
        },
        // Mood ratings sheet
        {
          properties: {
            title: "mood_ratings",
            gridProperties: {
              rowCount: 1000,
              columnCount: 3,
              frozenRowCount: 1,
            },
          },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "id" } },
                    { userEnteredValue: { stringValue: "date" } },
                    { userEnteredValue: { stringValue: "rating" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const response = await callGoogleSheetsAPI("spreadsheets", "POST", body);

    // Store the spreadsheet ID in localStorage for future use
    localStorage.setItem("simple_habits_sheet_id", response.spreadsheetId);

    return {
      spreadsheetId: response.spreadsheetId,
      spreadsheetUrl: response.spreadsheetUrl,
      name: response.properties.title,
      isNew: true,
    };
  } catch (error) {
    console.error("Error creating Simple Habits spreadsheet:", error);
    throw error;
  }
};

/**
 * Verifies if a spreadsheet exists and is accessible
 */
export const verifySpreadsheetExists = async (spreadsheetId: string) => {
  try {
    const response = await callGoogleSheetsAPI(
      `spreadsheets/${spreadsheetId}?fields=properties.title`,
    );
    return {
      exists: true,
      name: response.properties.title,
    };
  } catch (error) {
    return { exists: false };
  }
};

/**
 * Creates a test spreadsheet to verify the connection
 */
export const createTestSpreadsheet = async () => {
  try {
    // Create a simple test spreadsheet
    const body = {
      properties: {
        title: "Simple Habits Test Connection",
      },
      sheets: [
        {
          properties: {
            title: "Connection Test",
            gridProperties: {
              rowCount: 2,
              columnCount: 2,
            },
          },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "Test" } },
                    { userEnteredValue: { stringValue: "Success" } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: "Connection" } },
                    { userEnteredValue: { stringValue: "Works!" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const response = await callGoogleSheetsAPI("spreadsheets", "POST", body);

    return {
      success: true,
      spreadsheetId: response.spreadsheetId,
      spreadsheetUrl: response.spreadsheetUrl,
      name: response.properties.title,
    };
  } catch (error) {
    console.error("Error testing sheets connection:", error);
    throw error;
  }
};
