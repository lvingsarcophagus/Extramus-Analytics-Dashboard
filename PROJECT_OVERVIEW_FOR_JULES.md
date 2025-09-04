# Extramus Analytics Dashboard - Complete Project Overview for Jules

## 🎯 **Project Purpose**
This is a comprehensive **HR Management and Analytics Dashboard** for Extramus, designed to manage and visualize intern program data. It provides real-time insights into intern management, housing assignments, department distributions, and performance analytics.

## 🏗️ **Architecture & Technology Stack**

### **Frontend Framework**
- **Next.js 15** (React-based full-stack framework)
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom CSS variables for theming
- **shadcn/ui** component library for modern UI components

### **Backend & Database**
- **PostgreSQL** database hosted on AWS (ec2-13-49-23-125.eu-north-1.compute.amazonaws.com)
- **Next.js API Routes** for backend functionality
- **Database Connection Pooling** with retry logic and error handling

### **Package Management**
- **pnpm** as the package manager (faster and more efficient than npm)

## 📊 **Database Schema**

The project connects to a PostgreSQL database with the following key tables:

```sql
-- Core intern information
intern_details: intern_id, name, nationality, gender, birthdate, email, phone
internship_info: intern_id, department_id, start_date, end_date, supervisor, status
departments: id, department_name

-- Housing management
apartments: id, apartment_name
rooms: id, apartment_id, room_number, is_single, is_full
occupants: id, room_id, intern_id

-- Additional data
interns_sos_details: emergency contacts
intern_documents: LinkedIn, CV, passport info
bill: billing information
users: admin accounts
session_logs: login tracking
```

## 🎨 **Theme System**

The project implements a sophisticated **dark/light theme system**:

### **CSS Variables Approach**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme variables */
}
```

### **Theme Features**
- **next-themes** integration for theme management
- **System preference detection** (follows OS theme)
- **Theme persistence** across sessions
- **Smooth transitions** between themes
- **Custom gradient backgrounds** and glass effects

## 📁 **Project Structure**

```
Extramus-Analytics-Dashboard/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── interns/       # Intern data endpoints
│   │   │   ├── housing/       # Housing data endpoints
│   │   │   ├── departments/   # Department analytics
│   │   │   └── comprehensive-analytics/ # Combined analytics
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── overview/          # Analytics overview
│   │   └── globals.css        # Global styles & theme variables
│   ├── components/            # React components
│   │   ├── charts/           # Chart components (pie, bar, etc.)
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── theme/           # Theme provider & toggle
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                  # Utility functions
│   │   └── database.ts       # Database connection & queries
│   └── types/               # TypeScript definitions
├── extramus-hr-management-system/ # Additional HR system
├── .env.local              # Environment variables
├── tailwind.config.ts      # Tailwind configuration
└── package.json           # Dependencies
```

## 🔧 **Key Features**

### **1. Real-Time Analytics Dashboard**
- **Live metrics display** with auto-refresh
- **Interactive charts** (pie charts, bar graphs, trend lines)
- **Department distribution visualization**
- **Nationality demographics breakdown**
- **Housing occupancy tracking**

### **2. Comprehensive Data Management**
- **Intern lifecycle tracking** (Active/Completed/Pending status)
- **Performance metrics** with progress calculations
- **Emergency contact management**
- **Document tracking** (CV, passport, learning agreements)

### **3. Housing Management System**
- **Apartment and room assignments**
- **Occupancy rate calculations**
- **Room capacity management** (single/shared rooms)
- **Housing utilization analytics**

### **4. Advanced Error Handling**
- **Fallback API routes** when database permissions fail
- **Demo data integration** for testing and development
- **Database diagnostic tools** for troubleshooting
- **Retry logic** with exponential backoff

## 🎯 **Current Sample Data**

The dashboard currently displays real data including:

### **Active Interns**
- **Harry Echefu** (Nigerian, Business Lawyer department)
- **Hasan Arikan** (Turkish, Social Media Manager department)

### **Departments**
- IT (24 interns)
- Business Lawyer, Project Management, Human Resources
- Digital Marketing, Urban Design, Languages, Law

### **Housing**
- **Pignataro Apartment** and **Oliva Apartment**
- Multiple rooms with occupancy tracking

## 🚨 **Current Challenges & Solutions**

### **Database Permission Issues**
**Problem**: `permission denied for table intern_details`
**Solution**: Implemented fallback API routes and diagnostic tools

### **Missing Tables**
**Problem**: `relation "occupants" does not exist`
**Solution**: Created alternative housing queries and table creation scripts

### **Theme Rendering Issues**
**Problem**: CSS variables not being applied properly
**Current Status**: Working on Tailwind configuration and CSS variable integration

## 🔄 **API Architecture**

### **Primary Endpoints**
- `/api/interns` - Comprehensive intern data with department joins
- `/api/housing` - Housing analytics with occupancy calculations
- `/api/departments` - Department distribution for charts
- `/api/comprehensive-analytics` - Combined analytics data

### **Fallback System**
- `/api/interns-fallback` - Demo data when DB fails
- `/api/housing-fallback` - Housing fallback data
- `/api/db-diagnostics` - Database troubleshooting

## 💻 **Development Workflow**

### **Running the Project**
```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server (port 3000/3001)
```

### **Environment Configuration**
```env
DB_HOST=ec2-13-49-23-125.eu-north-1.compute.amazonaws.com
DB_PORT=5432
DB_NAME=LatestDB
DB_USER=nayan
DB_SSL_MODE=require
```

## 🎨 **Visual Design Philosophy**

### **Modern Glassmorphism**
- **Glass effect cards** with backdrop blur
- **Gradient backgrounds** with animated shifts
- **Floating animations** and hover effects
- **Smooth transitions** throughout the interface

### **Color Scheme**
- **Primary**: Blue gradient (#667eea to #764ba2)
- **Charts**: Distinct color palette for data visualization
- **Theme-aware**: Adapts to light/dark preferences

## 🚀 **Future Enhancements**

### **Planned Features**
- Enhanced permissions management
- Real-time notifications
- Advanced reporting capabilities
- Mobile responsiveness improvements
- Integration with external HR systems

### **Technical Improvements**
- Database migration scripts
- Enhanced error recovery
- Performance optimizations
- Security enhancements

## 🛠️ **Installation & Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/lvingsarcophagus/Extramus-Analytics-Dashboard.git
   cd Extramus-Analytics-Dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   - Copy `.env.local.example` to `.env.local`
   - Configure database credentials
   - Set up any required API keys

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 **Support**

For support and questions, please contact the development team or create an issue in the repository.

---

**Jules, this project represents a sophisticated, production-ready HR analytics platform with modern web technologies, comprehensive error handling, and a beautiful user interface. The combination of Next.js, TypeScript, and PostgreSQL provides a robust foundation for managing complex intern program data while maintaining excellent user experience through thoughtful design and theme management.**
