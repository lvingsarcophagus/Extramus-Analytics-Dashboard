import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get credentials from environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Sheets credentials not configured',
          details: {
            hasClientEmail: !!clientEmail,
            hasPrivateKey: !!privateKey,
            hasSheetId: !!sheetId
          }
        },
        { status: 500 }
      );
    }

    // Dynamic import to avoid build-time issues
    const { google } = await import('googleapis');

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Test connection by getting spreadsheet info
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    return NextResponse.json({
      success: true,
      message: 'Google Sheets connection successful',
      details: {
        title: response.data.properties?.title,
        sheets: response.data.sheets?.map(sheet => ({
          name: sheet.properties?.title,
          id: sheet.properties?.sheetId
        })),
        locale: response.data.properties?.locale,
        timeZone: response.data.properties?.timeZone
      }
    });

  } catch (error) {
    console.error('Google Sheets test error:', error);

    let errorMessage = 'Failed to connect to Google Sheets';
    let errorDetails = {};

    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        errorMessage = 'Authentication failed - invalid credentials';
        errorDetails = { type: 'auth', suggestion: 'Check your service account credentials' };
      } else if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'Permission denied - service account cannot access the sheet';
        errorDetails = { type: 'permission', suggestion: 'Share the Google Sheet with your service account email' };
      } else if (error.message.includes('NOT_FOUND')) {
        errorMessage = 'Sheet not found - invalid sheet ID';
        errorDetails = { type: 'not_found', suggestion: 'Check your GOOGLE_SHEET_ID' };
      } else {
        errorMessage = error.message;
        errorDetails = { type: 'unknown' };
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
