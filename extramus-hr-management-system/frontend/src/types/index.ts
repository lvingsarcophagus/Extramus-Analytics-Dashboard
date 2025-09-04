import { ReactNode } from 'react';

// User and Authentication Types
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'intern' | 'hr' | 'super_admin';
  createdAt: string;
  updatedAt: string;
  internDetails?: InternDetails;
}

export interface InternDetails {
  internId: number;
  name: string;
  nationality?: string;
  gender?: string;
  birthdate?: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  internshipInfo?: InternshipInfo[];
  documents?: InternDocument[];
}

export interface InternshipInfo {
  id: number;
  internId: number;
  departmentId?: number;
  startDate?: string;
  endDate?: string;
  supervisor: string;
  status?: 'Active' | 'Completed' | 'Rejected';
  department?: Department;
}

export interface Department {
  id: number;
  departmentName: string;
}

// Document Types
export interface InternDocument {
  id: number;
  internId: number;
  documentType: DocumentType;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  uploadedAt: string;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  isRequired: boolean;
  expiryDate?: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  intern?: InternDetails;
  latestVerification?: DocumentVerification;
}

export type DocumentType = 
  | 'CV' 
  | 'ID_PASSPORT' 
  | 'ERASMUS_FORMS' 
  | 'INTERNSHIP_AGREEMENT' 
  | 'INSURANCE' 
  | 'ACCEPTANCE_LETTER' 
  | 'LEARNING_AGREEMENT' 
  | 'FINAL_REPORT' 
  | 'PROFILE_PICTURE' 
  | 'OTHER';

export type DocumentStatus = 
  | 'pending' 
  | 'under_review' 
  | 'verified' 
  | 'rejected' 
  | 'expired';

export interface DocumentVerification {
  id: number;
  documentId: number;
  internId: number;
  verifierId?: number;
  action: 'approve' | 'reject' | 'request_revision' | 'upload' | 'delete';
  previousStatus: DocumentStatus;
  newStatus: DocumentStatus;
  comments?: string;
  verifiedAt: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  internId?: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  createdAt: string;
  readAt?: string;
  intern?: InternDetails;
}

export type NotificationType = 
  | 'document_uploaded' 
  | 'document_verified' 
  | 'document_rejected' 
  | 'document_expired' 
  | 'bill_due' 
  | 'system_announcement' 
  | 'housing_update';

// API Response Types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  user?: User;
  token?: string;
  error?: string;
  code?: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  data?: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  role?: 'intern' | 'hr' | 'super_admin';
}

export interface ProfileUpdateForm {
  fullName?: string;
  phone?: string;
  nationality?: string;
  gender?: 'Male' | 'Female' | 'Other';
  birthdate?: string;
}

export interface DocumentUploadForm {
  documentType: DocumentType;
  notes?: string;
  file: File;
}

export interface DocumentVerificationForm {
  action: 'approve' | 'reject' | 'request_revision';
  comments?: string;
}

// Analytics Types
export interface DocumentAnalytics {
  summary: {
    totalDocuments: number;
    verifiedDocuments: number;
    pendingDocuments: number;
    rejectedDocuments: number;
  };
  statusStats: Record<DocumentStatus, number>;
  typeStats: Record<DocumentType, number>;
  dailyUploads: Array<{
    date: string;
    count: number;
  }>;
  avgVerificationTimes: Array<{
    documentType: DocumentType;
    avgHours: number;
    count: number;
  }>;
  completionAnalysis: Array<{
    internId: number;
    name: string;
    department: string;
    totalDocuments: number;
    requiredCompleted: number;
    completionRate: number;
  }>;
}

export interface InternAnalytics {
  summary: {
    totalInterns: number;
    activeInternships: number;
    completedInternships: number;
  };
  nationalityStats: Record<string, number>;
  genderStats: Record<string, number>;
  departmentStats: Record<string, number>;
  internshipStatusStats: Record<string, number>;
  monthlyRegistrations: Array<{
    month: string;
    count: number;
  }>;
}

// UI State Types
export interface DocumentFilters {
  status?: DocumentStatus;
  documentType?: DocumentType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
}

export interface DashboardCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

// Error Types
export interface ApiError {
  error: string;
  code?: string;
  details?: any[];
  statusCode?: number;
}

// Upload Types
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}
