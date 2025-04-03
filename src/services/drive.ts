import { callGoogleDriveAPI } from "../googleClient";

/**
 * Lists all spreadsheets in the user's account
 */
export const listAllSpreadsheets = async () => {
  try {
    // Search for all files of type spreadsheet
    const response = await callGoogleDriveAPI(
      'files?q=mimeType="application/vnd.google-apps.spreadsheet"',
    );

    return response.files || [];
  } catch (error) {
    console.error("Error listing spreadsheets:", error);
    throw error;
  }
};

/**
 * Finds a spreadsheet by name that's not in trash
 */
export const findSpreadsheetByName = async (name: string) => {
  try {
    // Search for spreadsheets with the given name and not in trash
    const response = await callGoogleDriveAPI(
      `files?q=name='${name}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    );

    const files = response.files || [];
    return files.length > 0 ? files[0] : null;
  } catch (error) {
    console.error(`Error finding spreadsheet named "${name}":`, error);
    throw error;
  }
};

/**
 * Checks if a file is in trash
 */
export const isFileInTrash = async (fileId: string) => {
  try {
    const fileInfo = await callGoogleDriveAPI(`files/${fileId}?fields=trashed`);
    return fileInfo.trashed === true;
  } catch (error) {
    console.error(`Error checking if file ${fileId} is in trash:`, error);
    throw error;
  }
};

/**
 * Creates a spreadsheet URL from a spreadsheet ID
 */
export const getSpreadsheetUrl = (spreadsheetId: string) => {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
};
