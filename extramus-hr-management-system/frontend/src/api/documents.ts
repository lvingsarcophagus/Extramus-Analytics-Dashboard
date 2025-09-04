import apiClient from './client';
import { 
  InternDocument, 
  DocumentUploadForm, 
  DocumentVerificationForm,
  DocumentFilters,
  PaginatedResponse,
  ApiResponse,
  DocumentAnalytics 
} from '@/types';

export const documentApi = {
  // Get documents for current user (intern)
  async getMyDocuments(): Promise<ApiResponse<{ documents: InternDocument[] }>> {
    return apiClient.get('/documents/my-documents');
  },

  // Get documents for specific intern (admin/manager view)
  async getInternDocuments(internId: number, filters?: DocumentFilters): Promise<ApiResponse<{ documents: InternDocument[] }>> {
    return apiClient.get(`/documents/intern/${internId}`, filters);
  },

  // Get all documents with pagination and filters (admin view)
  async getAllDocuments(filters?: DocumentFilters): Promise<PaginatedResponse<InternDocument> & { documents: InternDocument[] }> {
    return apiClient.get('/documents/all', filters);
  },

  // Upload document
  async uploadDocument(
    data: DocumentUploadForm, 
    onUploadProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ document: InternDocument }>> {
    const formData = new FormData();
    formData.append('document', data.file);
    formData.append('documentType', data.documentType);
    if (data.notes) {
      formData.append('notes', data.notes);
    }

    return apiClient.upload('/documents/upload', formData, onUploadProgress);
  },

  // Update document status (verify/reject)
  async updateDocumentStatus(
    documentId: number, 
    data: DocumentVerificationForm
  ): Promise<ApiResponse<{ document: InternDocument }>> {
    return apiClient.put(`/documents/${documentId}/status`, data);
  },

  // Download document
  async downloadDocument(documentId: number, filename?: string): Promise<void> {
    return apiClient.download(`/documents/${documentId}/download`, filename);
  },

  // Delete document
  async deleteDocument(documentId: number): Promise<ApiResponse> {
    return apiClient.delete(`/documents/${documentId}`);
  },

  // Get document statistics
  async getDocumentStats(): Promise<ApiResponse<DocumentAnalytics>> {
    return apiClient.get('/documents/stats/overview');
  },

  // Bulk operations (admin only)
  async bulkVerifyDocuments(documentIds: number[]): Promise<ApiResponse> {
    return apiClient.post('/documents/bulk/verify', { documentIds });
  },

  async bulkRejectDocuments(documentIds: number[], reason?: string): Promise<ApiResponse> {
    return apiClient.post('/documents/bulk/reject', { documentIds, reason });
  },
};

export default documentApi;
