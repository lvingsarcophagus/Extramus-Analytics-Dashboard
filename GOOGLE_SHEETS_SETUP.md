# Google Sheets API Setup

## Required Environment Variables

Create a `.env.local` file in your project root and add these variables:

```env
# Google Sheets Service Account Credentials
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your-google-sheet-id-here
```

## Step-by-Step Setup:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create or Select a Project**:
   - Create a new project or select an existing one

3. **Enable Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

4. **Create Service Account**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Give it a name (e.g., "dashboard-export")
   - Click "Create and Continue"
   - Skip the optional steps, click "Done"

5. **Generate Private Key**:
   - In the "Credentials" page, find your service account
   - Click the email address
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the JSON file

6. **Extract Credentials from JSON**:
   - Open the downloaded JSON file
   - Copy the `client_email` value to `GOOGLE_CLIENT_EMAIL`
   - Copy the `private_key` value to `GOOGLE_PRIVATE_KEY`
   - **Important**: Keep the `\n` characters in the private key as-is

7. **Create a Google Sheet**:
   - Go to https://sheets.google.com/
   - Create a new blank spreadsheet
   - Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)
   - Paste it as `GOOGLE_SHEET_ID`

8. **Share the Sheet with Service Account**:
   - In your Google Sheet, click "Share"
   - Paste the service account email (from `client_email`)
   - Give it "Editor" permissions
   - Click "Share"

## Testing the Setup

Once configured, restart your development server and try exporting data to Google Sheets from the dashboard.
