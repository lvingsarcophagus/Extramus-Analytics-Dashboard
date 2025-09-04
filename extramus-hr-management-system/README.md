# Extramus HR Management System - Document Management Module

A comprehensive document management system built with modern web technologies for HR operations.

## 🚀 Tech Stack

- **Backend:** Node.js (v20.x), Express.js, JavaScript
- **Database:** PostgreSQL with Prisma ORM
- **Frontend:** React, TypeScript, Next.js (v14.x)
- **UI:** Tailwind CSS, ShadCN UI
- **Authentication:** JWT, Passport.js
- **File Management:** Multer

## 📁 Project Structure

```
document-management/
├── backend/          # Express.js API server
├── frontend/         # Next.js React application
└── .github/          # GitHub configuration
```

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd document-management
```

### 2. Install Dependencies
```bash
yarn install-all
```

### 3. Environment Setup
```bash
# Backend
cp backend/.env.example backend/.env
# Configure your database and JWT secrets

# Frontend
cp frontend/.env.local.example frontend/.env.local
```

### 4. Database Setup
```bash
yarn db:generate
yarn db:push
```

### 5. Start Development
```bash
yarn dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 Features

### Document Management
- ✅ Upload with drag-and-drop
- ✅ Document verification workflow
- ✅ Role-based access control
- ✅ Bulk operations
- ✅ Version control

### User Roles
- **Intern:** Upload documents, track status
- **HR Manager:** Review and approve documents
- **Super Admin:** System analytics and management

### Analytics & Reporting
- ✅ Real-time dashboard
- ✅ Completion rate tracking
- ✅ Export capabilities
- ✅ Audit trails

## 🛠️ Available Scripts

```bash
yarn dev              # Start both frontend and backend
yarn build           # Build for production
yarn start           # Start production server
yarn db:generate     # Generate Prisma client
yarn db:push         # Push schema to database
yarn db:studio       # Open Prisma Studio
```

## 🔐 Security Features

- JWT-based authentication
- Role-based authorization
- File type validation
- Input sanitization
- Rate limiting
- Audit logging

## 📱 Responsive Design

Fully responsive interface optimized for:
- Desktop computers
- Tablets
- Mobile devices

## 🚀 Production Ready

- Comprehensive error handling
- Input validation
- Security best practices
- Performance optimizations
- Production build scripts

## 📄 License

Private - Extramus HR Management System