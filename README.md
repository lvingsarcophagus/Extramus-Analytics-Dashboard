# Extramus Analytics Dashboard

A comprehensive web dashboard for managing and analyzing intern programs and housing operations, built with Next.js and shadcn/ui.

## 🚀 Overview

This dashboard provides real-time insights into intern program performance and housing occupancy, enabling data-driven decisions for program coordinators, HR teams, and housing managers.

## ⚠️ Important Note About Database Issues

If you're experiencing database permission errors or missing tables, please refer to the [Database Permissions Guide](./DATABASE_PERMISSIONS_GUIDE.md) for detailed solutions.

### Key Features

- **📊 Interactive Analytics**: Real-time charts and metrics for intern trends, project completion, and housing occupancy
- **🔐 Role-Based Access**: Secure, permission-based views for different user roles (Admin, HR, Housing, Department Heads)
- **📱 Responsive Design**: Optimized for desktop and mobile use
- **📈 Data Visualization**: Interactive charts using Recharts library
- **📋 Export Capabilities**: PDF reports and CSV data exports
- **🎯 Filtered Views**: Time range, department, season, and year filtering

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **TypeScript**: Full type safety
- **State Management**: React Context API

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── charts/            # Chart components
│   └── dashboard/         # Dashboard-specific components
├── contexts/              # React Context providers
├── lib/
│   ├── data/              # Sample data and mock APIs
│   └── analytics.ts       # Analytics calculation utilities
└── types/                 # TypeScript type definitions
```

## 📊 Dashboard Sections

### Overview Tab
- Key performance metrics (total interns, active interns, completed projects, housing occupancy)
- Department distribution chart
- Seasonal trends analysis

### Intern Analytics Tab
- Nationality and gender distribution (HR/Admin only)
- Project success rates
- Department-wise breakdowns
- Cohort insights

### Housing Analytics Tab
- Occupancy rates and availability
- Unit type distribution
- Quick action buttons for housing management
- Lease expiration tracking

## 🔐 Role-Based Permissions

### Administrator
- Full access to all features and data
- Can export all report types
- Manages system settings

### Human Resources
- Access to intern data and demographics
- Can view and export intern analytics
- Limited housing visibility

### Housing Manager
- Full housing operations access
- Unit management and occupancy tracking
- Maintenance scheduling

### Department Head
- Department-specific intern data
- Project oversight and completion tracking
- Limited demographic access

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lvingsarcophagus/Extramus-Analytics-Dashboard.git
cd Extramus-Analytics-Dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Users
The application includes demo users for testing different role permissions:

- **Jules Anderson** (Admin): `jules@company.com`
- **Sarah Kim** (HR): `sarah.kim@company.com`
- **Mike Johnson** (Housing): `mike.johnson@company.com`
- **Dr. Lisa Chen** (Department Head): `lisa.chen@company.com`

## 📱 Features in Detail

### Filtering System
- **Time Range**: Month, semester, or year views
- **Department**: Filter by specific departments
- **Season**: Summer, winter, spring, fall cohorts
- **Year**: Multi-year comparison capabilities

### Export Functionality
- **PDF Reports**: Formatted reports with charts for presentations
- **CSV Data**: Raw data for further analysis in Excel or other tools
- **Audit Trail**: All exports are logged for security compliance

### Data Visualizations
- **Bar Charts**: Department distributions and comparisons
- **Line Charts**: Trend analysis over time
- **Pie Charts**: Demographic breakdowns and proportions
- **Metric Cards**: Key performance indicators with trend indicators

### Security Features
- **Input Validation**: All filter inputs are validated
- **Role-Based UI**: Interface adapts based on user permissions
- **Audit Logging**: Export activities are tracked
- **Session Management**: Secure user authentication

## � Google Sheets Export Setup

The dashboard supports exporting data directly to Google Sheets. To enable this feature:

### Prerequisites
- Google Cloud Console account
- Google Sheets API enabled
- Service Account credentials

### Quick Setup
1. Follow the detailed guide in `GOOGLE_SHEETS_SETUP.md`
2. Copy `.env.local.example` to `.env.local`
3. Fill in your service account credentials
4. Restart the development server

### Required Environment Variables
```env
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your-google-sheet-id-here
```

## �🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Components

The project uses shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

### Data Structure

The application uses TypeScript interfaces for type safety:

- `Intern`: Individual intern records
- `Project`: Project assignments and completion tracking
- `HousingUnit`: Housing facility information
- `User`: User accounts and role definitions

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core analytics views
- ✅ Role-based access control
- ✅ Basic export functionality
- ✅ Responsive design

### Phase 2 (Planned)
- 🔄 Saved filter presets
- 🔄 Scheduled email reports
- 🔄 Advanced annotations and notes
- 🔄 Real-time data synchronization

### Phase 3 (Future)
- 📋 Integration with external HR systems
- 📋 Advanced predictive analytics
- 📋 Mobile app companion
- 📋 API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support

For questions or support, please contact:
- **Project Lead**: Jules Anderson
- **Technical Lead**: Development Team
- **Documentation**: See `/docs` folder for detailed guides

---

Built with ❤️ using Next.js and shadcn/ui
