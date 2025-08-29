import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { data, type } = await request.json();
    
    console.log('Export request received:', { type, dataLength: Array.isArray(data) ? data.length : 'not array' });

    // Get credentials from environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    console.log('Environment check:', {
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      hasSheetId: !!sheetId,
      clientEmail: clientEmail ? 'present' : 'missing',
      privateKeyLength: privateKey ? privateKey.length : 0,
      sheetId: sheetId ? 'present' : 'missing'
    });

    if (!clientEmail || !privateKey || !sheetId) {
      return NextResponse.json(
        { error: 'Google Sheets credentials not configured. Please check your environment variables.' },
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

    // Test the connection first
    try {
      console.log('Testing Google Sheets connection...');
      const testResponse = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });
      console.log('Google Sheets connection test successful:', {
        title: testResponse.data.properties?.title,
        sheets: testResponse.data.sheets?.length
      });
    } catch (connectionError) {
      console.error('Google Sheets connection test failed:', connectionError);
      return NextResponse.json(
        { error: 'Failed to connect to Google Sheets. Please check your credentials and sheet permissions.' },
        { status: 500 }
      );
    }

    let range: string;
    let values: string[][];
    let internsArray: any[] = [];

    if (type === 'interns') {
      range = 'Sheet1!A1';
      
      // Ensure data is an array
      internsArray = Array.isArray(data) ? data : [];
      
      console.log('Processing interns data:', {
        isArray: Array.isArray(data),
        length: internsArray.length,
        firstItem: internsArray[0] ? Object.keys(internsArray[0]) : 'no items'
      });
      
      if (internsArray.length === 0) {
        return NextResponse.json(
          { error: 'No intern data provided for export' },
          { status: 400 }
        );
      }
      
      values = [
        ['Name', 'Email', 'Department', 'Status', 'Nationality', 'Gender', 'Start Date', 'End Date'],
        ...internsArray.map((intern: {
          name?: string;
          email?: string;
          department?: string;
          status?: string;
          nationality?: string;
          gender?: string;
          start_date?: string;
          end_date?: string;
        }) => [
          intern.name || '',
          intern.email || '',
          intern.department || '',
          intern.status || '',
          intern.nationality || '',
          intern.gender || '',
          intern.start_date || '',
          intern.end_date || '',
        ]),
      ];
    } else {
      // General export
      range = 'Report!A1';
      values = Array.isArray(data) ? data : [data];
    }

    console.log('Prepared data for Google Sheets:', {
      range,
      valuesLength: values.length,
      firstRow: values[0],
      sheetId: sheetId.substring(0, 10) + '...' // Log partial sheet ID for debugging
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    // Add formatting to make the sheet look professional
    if (type === 'interns' && internsArray.length > 0) {
      const numRows = values.length;
      const numCols = values[0].length;

      // Format header row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            // Header row formatting - blue background, white text, bold
            {
              repeatCell: {
                range: {
                  sheetId: 0, // Sheet1 has ID 0
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: numCols
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                    textFormat: {
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                      bold: true,
                      fontSize: 11
                    },
                    horizontalAlignment: 'CENTER'
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
              }
            },
            // Data rows formatting - alternate row colors
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 1,
                  endRowIndex: numRows,
                  startColumnIndex: 0,
                  endColumnIndex: numCols
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
                    textFormat: {
                      fontSize: 10
                    },
                    horizontalAlignment: 'LEFT'
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
              }
            },
            // Add borders to all cells
            {
              updateBorders: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: numRows,
                  startColumnIndex: 0,
                  endColumnIndex: numCols
                },
                top: {
                  style: 'SOLID',
                  width: 1,
                  color: { red: 0.8, green: 0.8, blue: 0.8 }
                },
                bottom: {
                  style: 'SOLID',
                  width: 1,
                  color: { red: 0.8, green: 0.8, blue: 0.8 }
                },
                left: {
                  style: 'SOLID',
                  width: 1,
                  color: { red: 0.8, green: 0.8, blue: 0.8 }
                },
                right: {
                  style: 'SOLID',
                  width: 1,
                  color: { red: 0.8, green: 0.8, blue: 0.8 }
                },
                innerHorizontal: {
                  style: 'SOLID',
                  width: 1,
                  color: { red: 0.9, green: 0.9, blue: 0.9 }
                },
                innerVertical: {
                  style: 'SOLID',
                  width: 1,
                  color: { red: 0.9, green: 0.9, blue: 0.9 }
                }
              }
            },
            // Auto-resize columns
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: 0,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: numCols
                }
              }
            },
            // Freeze header row
            {
              updateSheetProperties: {
                properties: {
                  sheetId: 0,
                  gridProperties: {
                    frozenRowCount: 1
                  }
                },
                fields: 'gridProperties.frozenRowCount'
              }
            },
            // Add conditional formatting for status column (column D)
            {
              addConditionalFormatRule: {
                rule: {
                  ranges: [{
                    sheetId: 0,
                    startRowIndex: 1,
                    endRowIndex: numRows,
                    startColumnIndex: 3, // Status column (0-indexed)
                    endColumnIndex: 4
                  }],
                  booleanRule: {
                    condition: {
                      type: 'TEXT_EQ',
                      values: [{ userEnteredValue: 'active' }]
                    },
                    format: {
                      backgroundColor: { red: 0.8, green: 0.9, blue: 0.8 },
                      textFormat: {
                        foregroundColor: { red: 0.2, green: 0.5, blue: 0.2 },
                        bold: true
                      }
                    }
                  }
                },
                index: 0
              }
            },
            // Conditional formatting for completed status
            {
              addConditionalFormatRule: {
                rule: {
                  ranges: [{
                    sheetId: 0,
                    startRowIndex: 1,
                    endRowIndex: numRows,
                    startColumnIndex: 3,
                    endColumnIndex: 4
                  }],
                  booleanRule: {
                    condition: {
                      type: 'TEXT_EQ',
                      values: [{ userEnteredValue: 'completed' }]
                    },
                    format: {
                      backgroundColor: { red: 0.9, green: 0.9, blue: 0.8 },
                      textFormat: {
                        foregroundColor: { red: 0.3, green: 0.4, blue: 0.2 },
                        bold: true
                      }
                    }
                  }
                },
                index: 1
              }
            },
            // Conditional formatting for pending status
            {
              addConditionalFormatRule: {
                rule: {
                  ranges: [{
                    sheetId: 0,
                    startRowIndex: 1,
                    endRowIndex: numRows,
                    startColumnIndex: 3,
                    endColumnIndex: 4
                  }],
                  booleanRule: {
                    condition: {
                      type: 'TEXT_EQ',
                      values: [{ userEnteredValue: 'pending' }]
                    },
                    format: {
                      backgroundColor: { red: 1, green: 0.95, blue: 0.8 },
                      textFormat: {
                        foregroundColor: { red: 0.6, green: 0.4, blue: 0.2 },
                        bold: true
                      }
                    }
                  }
                },
                index: 2
              }
            }
          ]
        }
      });

      console.log('Applied formatting to Google Sheets');
    }

    console.log('Google Sheets export successful');
    return NextResponse.json({
      success: true,
      message: type === 'interns' 
        ? `Intern data exported to Google Sheets with professional formatting! 🎨`
        : `Data exported to Google Sheets successfully to sheet: ${range.split('!')[0]}`,
      details: {
        sheet: range.split('!')[0],
        rows: values.length,
        columns: values[0]?.length || 0,
        formatted: type === 'interns',
        features: type === 'interns' ? [
          'Professional header styling',
          'Alternating row colors',
          'Auto-sized columns',
          'Frozen header row',
          'Status-based conditional formatting',
          'Clean borders and spacing'
        ] : []
      }
    });

  } catch (error) {
    console.error('Google Sheets export error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to export to Google Sheets';
    
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        errorMessage = 'Google Sheets authentication failed. Please check your service account credentials.';
      } else if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'Permission denied. Please check that your service account has access to the Google Sheet.';
      } else if (error.message.includes('NOT_FOUND')) {
        errorMessage = 'Google Sheet not found. Please check your sheet ID.';
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        errorMessage = 'Google Sheets API quota exceeded. Please try again later.';
      } else {
        errorMessage = `Export failed: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
