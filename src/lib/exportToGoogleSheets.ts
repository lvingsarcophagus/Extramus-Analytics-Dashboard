import { google } from 'googleapis';

/**
 * Server-side function for exporting data to Google Sheets
 * This should only be used in server-side code (API routes, server components)
 * For client-side usage, use the /api/export-google-sheets endpoint instead
 */
export async function exportToGoogleSheets({
  sheetId,
  range,
  values,
  serviceAccount,
}: {
  sheetId: string;
  range: string; // e.g., 'Sheet1!A1'
  values: any[][];
  serviceAccount: {
    client_email: string;
    private_key: string;
  };
}) {
  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}

// Helper function to export intern data specifically
export async function exportInternDataToSheets({
  sheetId,
  internData,
  serviceAccount,
}: {
  sheetId: string;
  internData: Array<{
    name: string;
    email: string;
    department: string;
    status: string;
    nationality: string;
    gender: string;
    start_date?: string;
    end_date?: string;
  }>;
  serviceAccount: {
    client_email: string;
    private_key: string;
  };
}) {
  // Ensure internData is an array
  if (!Array.isArray(internData)) {
    throw new Error('internData must be an array');
  }

  if (internData.length === 0) {
    throw new Error('No intern data provided for export');
  }

  const headers = ['Name', 'Email', 'Department', 'Status', 'Nationality', 'Gender', 'Start Date', 'End Date'];
  const values = [
    headers,
    ...internData.map(intern => [
      intern.name,
      intern.email,
      intern.department,
      intern.status,
      intern.nationality,
      intern.gender,
      intern.start_date || '',
      intern.end_date || '',
    ]),
  ];

  await exportToGoogleSheets({
    sheetId,
    range: 'Sheet1!A1',
    values,
    serviceAccount,
  });
}
