import { callGoogleSheetsAPI } from "../googleClient";
import * as driveService from "./drive";
import * as sheetsService from "./sheets";

// Types for spreadsheet operations
export interface SheetRow {
  [key: string]: any;
}

interface SheetUpdateResponse {
  spreadsheetId: string;
  updatedRange: string;
  updatedRows: number;
  updatedColumns: number;
  updatedCells: number;
}

interface SheetAppendResponse {
  spreadsheetId: string;
  tableRange: string;
  updates: {
    spreadsheetId: string;
    updatedRange: string;
    updatedRows: number;
    updatedColumns: number;
    updatedCells: number;
  };
}

// Get the spreadsheet ID from localStorage
export const getSpreadsheetId = (): string => {
  const id = localStorage.getItem("simple_habits_sheet_id");
  if (!id) {
    throw new Error(
      "Spreadsheet ID not found. Please initialize the spreadsheet first.",
    );
  }
  return id;
};

// Read all rows from a sheet
export const readSheet = async (sheetName: string): Promise<any[][]> => {
  try {
    const spreadsheetId = getSpreadsheetId();
    const response = await callGoogleSheetsAPI(
      `spreadsheets/${spreadsheetId}/values/${sheetName}`,
    );
    return response.values || [];
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error);
    throw error;
  }
};

// Read rows from a sheet with specific range
export const readSheetRange = async (
  sheetName: string,
  range: string,
): Promise<any[][]> => {
  try {
    const spreadsheetId = getSpreadsheetId();
    const response = await callGoogleSheetsAPI(
      `spreadsheets/${spreadsheetId}/values/${sheetName}!${range}`,
    );
    return response.values || [];
  } catch (error) {
    console.error(
      `Error reading range ${range} from sheet ${sheetName}:`,
      error,
    );
    throw error;
  }
};

// Write rows to a sheet
export const writeSheet = async (
  sheetName: string,
  range: string,
  values: any[][],
): Promise<SheetUpdateResponse> => {
  try {
    const spreadsheetId = getSpreadsheetId();
    const body = {
      values,
    };
    const response = await callGoogleSheetsAPI(
      `spreadsheets/${spreadsheetId}/values/${sheetName}!${range}?valueInputOption=USER_ENTERED`,
      "PUT",
      body,
    );
    return response;
  } catch (error) {
    console.error(`Error writing to sheet ${sheetName}:`, error);
    throw error;
  }
};

// Append rows to a sheet
export const appendSheet = async (
  sheetName: string,
  values: any[][],
): Promise<SheetAppendResponse> => {
  try {
    const spreadsheetId = getSpreadsheetId();
    const body = {
      values,
    };
    const response = await callGoogleSheetsAPI(
      `spreadsheets/${spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      "POST",
      body,
    );
    return response;
  } catch (error) {
    console.error(`Error appending to sheet ${sheetName}:`, error);
    throw error;
  }
};

// Convert row data to array (for writing to sheets)
export const rowToArray = (headers: string[], row: SheetRow): any[] => {
  return headers.map((header) =>
    row[header] !== undefined ? row[header] : "",
  );
};

// Convert array to row data (for reading from sheets)
export const arrayToRow = (headers: string[], array: any[]): SheetRow => {
  const row: SheetRow = {};
  headers.forEach((header, index) => {
    row[header] = array[index];
  });
  return row;
};

// Find a row by value in a specific column
export const findRowByValue = (
  rows: any[][],
  headers: string[],
  column: string,
  value: any,
): [SheetRow, number] | [null, -1] => {
  const columnIndex = headers.indexOf(column);

  if (columnIndex === -1) {
    throw new Error(`Column ${column} not found in headers`);
  }

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][columnIndex] === value) {
      return [arrayToRow(headers, rows[i]), i];
    }
  }

  return [null, -1];
};

// Update a specific row
export const updateRow = async (
  sheetName: string,
  rowIndex: number,
  headers: string[],
  row: SheetRow,
): Promise<SheetUpdateResponse> => {
  try {
    // Convert rowIndex to 1-based (Google Sheets API uses 1-based indexing)
    const range = `A${rowIndex + 1}:${String.fromCharCode(65 + headers.length - 1)}${rowIndex + 1}`;
    const values = [rowToArray(headers, row)];
    return await writeSheet(sheetName, range, values);
  } catch (error) {
    console.error(
      `Error updating row ${rowIndex} in sheet ${sheetName}:`,
      error,
    );
    throw error;
  }
};

// Delete a row (simulated by clearing the row's contents)
export const deleteRow = async (
  sheetName: string,
  rowIndex: number,
  columns: number,
): Promise<SheetUpdateResponse> => {
  try {
    // Convert rowIndex to 1-based (Google Sheets API uses 1-based indexing)
    const range = `A${rowIndex + 1}:${String.fromCharCode(65 + columns - 1)}${rowIndex + 1}`;
    // Create an empty row with the same number of columns
    const values = [new Array(columns).fill("")];
    return await writeSheet(sheetName, range, values);
  } catch (error) {
    console.error(
      `Error deleting row ${rowIndex} in sheet ${sheetName}:`,
      error,
    );
    throw error;
  }
};

// Generate a unique ID for a new row
export const generateId = (): string => {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
};

/**
 * Gets or creates a Simple Habits spreadsheet
 */
export const getOrCreateSimpleHabitsSpreadsheet = async () => {
  try {
    // First, check if we have a stored ID
    const storedId = localStorage.getItem("simple_habits_sheet_id");
    if (storedId) {
      try {
        // Verify the sheet still exists and is accessible
        const sheetVerification =
          await sheetsService.verifySpreadsheetExists(storedId);

        // Check if it's trashed using Drive API
        const isInTrash = await driveService.isFileInTrash(storedId);

        // Skip this sheet if it's in trash
        if (isInTrash) {
          console.warn(
            "Stored spreadsheet exists but is in trash, creating a new one",
          );
          localStorage.removeItem("simple_habits_sheet_id");
          // Continue to creating a new sheet
        } else if (sheetVerification.exists) {
          // Not trashed and exists, so we can use it
          return {
            spreadsheetId: storedId,
            name: sheetVerification.name,
            isNew: false,
            spreadsheetUrl: driveService.getSpreadsheetUrl(storedId),
          };
        }
      } catch (error) {
        // Sheet might have been deleted or access revoked - continue to find/create
        console.warn(
          "Stored spreadsheet not found, will find or create a new one",
        );
        localStorage.removeItem("simple_habits_sheet_id");
      }
    }

    // Search for an existing Simple Habits spreadsheet
    const existingSheet =
      await driveService.findSpreadsheetByName("Simple Habits");

    if (existingSheet) {
      // Found an existing sheet, store its ID
      localStorage.setItem("simple_habits_sheet_id", existingSheet.id);
      return {
        spreadsheetId: existingSheet.id,
        name: existingSheet.name,
        isNew: false,
        spreadsheetUrl: driveService.getSpreadsheetUrl(existingSheet.id),
      };
    } else {
      // Create a new Simple Habits spreadsheet
      return await sheetsService.createSimpleHabitsSpreadsheet();
    }
  } catch (error) {
    console.error(
      "Error finding or creating Simple Habits spreadsheet:",
      error,
    );
    throw error;
  }
};

/**
 * Test the connection to Google Sheets
 */
export const testSheetsConnection = async () => {
  return await sheetsService.createTestSpreadsheet();
};
