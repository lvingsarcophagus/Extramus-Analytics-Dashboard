import { exportToGoogleSheets } from './exportToGoogleSheets';

export async function exampleExport() {
  const serviceAccount = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  };

  const sheetId = process.env.GOOGLE_SHEET_ID!;
  const range = 'Sheet1!A1';
  const values = [
    ['Name', 'Department', 'Status'],
    ['Sarah Johnson', 'Engineering', 'Active'],
    ['Ahmed Hassan', 'Marketing', 'Completed'],
  ];

  await exportToGoogleSheets({
    sheetId,
    range,
    values,
    serviceAccount,
  });
}
