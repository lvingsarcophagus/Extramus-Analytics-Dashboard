# Netlify Deployment Guide

## 🚀 Deploying to Netlify

### Prerequisites
1. Netlify account
2. GitHub repository connected to Netlify
3. Environment variables configured

### Environment Variables Setup

In your Netlify dashboard, go to **Site Settings > Environment Variables** and add:

#### Database Configuration
```
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_SSL_MODE=require
```

#### Google Sheets API Configuration
```
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
GOOGLE_SHEET_ID=your-google-sheet-id-here
```

#### Application Configuration
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-netlify-site.netlify.app
```

### Build Settings

The `netlify.toml` file is already configured with:
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: 18.18.0 (minimum required for Next.js)

### Common Issues & Solutions

#### 1. Build Fails with Next.js Plugin Error
- ✅ **Fixed**: Updated `netlify.toml` with proper configuration
- ✅ **Fixed**: Updated `next.config.ts` for Netlify compatibility
- ✅ **Fixed**: Added `.nvmrc` for Node.js version specification

#### 2. Database Connection Issues
- Ensure all database environment variables are set in Netlify
- Check that your database allows connections from Netlify's IP ranges
- Verify SSL settings match your database configuration

#### 3. Google Sheets API Issues
- Ensure service account credentials are properly formatted
- Check that the Google Sheet is shared with the service account email
- Verify the sheet ID is correct

### Deployment Steps

1. **Connect Repository**: Connect your GitHub repository to Netlify
2. **Configure Environment Variables**: Add all required environment variables
3. **Deploy**: Netlify will automatically build and deploy your site
4. **Verify**: Check that all features work correctly in production

### Troubleshooting

If you encounter deployment issues:

1. **Check Build Logs**: Review the build logs in Netlify dashboard
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Check Node.js Version**: Confirm Node.js 18 is being used
4. **Database Connectivity**: Test database connection from your local environment

### Post-Deployment

After successful deployment:
- Test all dashboard features
- Verify data accuracy in charts
- Check export functionality
- Confirm user authentication works

### Support

If you continue to experience issues:
1. Check the Netlify build logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure your database is accessible from Netlify
4. Check that Google Sheets API credentials are valid
