import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';

interface Document {
  id: string;
  fileName: string;
  originalName: string;
  type: string;
  size: number;
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  userId: string;
  userInfo: {
    fullName: string;
    email: string;
    department?: string;
    nationality?: string;
  };
  metadata?: any;
}

export default function AdminDocumentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Check if user has permission to access admin documents
    if (user && !['hr', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchDocuments();
    }
  }, [user, authLoading, router]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Demo documents data for admin view
      const demoDocuments: Document[] = [
        {
          id: '1',
          fileName: 'passport_john_doe.pdf',
          originalName: 'passport.pdf',
          type: 'passport',
          size: 1024000,
          status: 'pending',
          uploadedAt: '2024-01-15T10:00:00Z',
          userId: '1',
          userInfo: {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            department: 'Engineering',
            nationality: 'USA'
          },
          metadata: { pages: 2 }
        },
        {
          id: '2',
          fileName: 'diploma_jane_smith.pdf',
          originalName: 'university_diploma.pdf',
          type: 'diploma',
          size: 2048000,
          status: 'under_review',
          uploadedAt: '2024-01-18T09:15:00Z',
          userId: '2',
          userInfo: {
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            department: 'Marketing',
            nationality: 'Canada'
          },
          metadata: { pages: 1 }
        },
        {
          id: '3',
          fileName: 'transcript_mike_wilson.pdf',
          originalName: 'official_transcript.pdf',
          type: 'transcript',
          size: 1536000,
          status: 'verified',
          uploadedAt: '2024-01-20T16:45:00Z',
          verifiedAt: '2024-01-22T11:30:00Z',
          userId: '3',
          userInfo: {
            fullName: 'Mike Wilson',
            email: 'mike.wilson@example.com',
            department: 'Finance',
            nationality: 'UK'
          },
          metadata: { pages: 4 }
        },
        {
          id: '4',
          fileName: 'visa_sarah_johnson.pdf',
          originalName: 'student_visa.pdf',
          type: 'visa',
          size: 890000,
          status: 'rejected',
          uploadedAt: '2024-01-25T14:20:00Z',
          rejectionReason: 'Document quality too low, please resubmit with better quality',
          userId: '4',
          userInfo: {
            fullName: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            department: 'Operations',
            nationality: 'Australia'
          },
          metadata: { pages: 1 }
        },
        {
          id: '5',
          fileName: 'insurance_alex_brown.pdf',
          originalName: 'health_insurance.pdf',
          type: 'insurance',
          size: 756000,
          status: 'pending',
          uploadedAt: '2024-01-28T08:30:00Z',
          userId: '5',
          userInfo: {
            fullName: 'Alex Brown',
            email: 'alex.brown@example.com',
            department: 'HR',
            nationality: 'Germany'
          },
          metadata: { pages: 3 }
        }
      ];

      setDocuments(demoDocuments);
      setError('');
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: Document['status']) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      pending: 'Pending',
      under_review: 'Under Review',
      verified: 'Verified',
      rejected: 'Rejected'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    // Simulate API call
    alert(`Document ${documentId} status changed to ${newStatus}`);
    
    // Update local state
    setDocuments(documents.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: newStatus as Document['status'], verifiedAt: newStatus === 'verified' ? new Date().toISOString() : undefined }
        : doc
    ));
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedDocuments.length === 0) return;
    
    alert(`Bulk action "${bulkAction}" applied to ${selectedDocuments.length} documents`);
    
    if (bulkAction === 'verify') {
      setDocuments(documents.map(doc => 
        selectedDocuments.includes(doc.id) 
          ? { ...doc, status: 'verified', verifiedAt: new Date().toISOString() }
          : doc
      ));
    } else if (bulkAction === 'reject') {
      setDocuments(documents.map(doc => 
        selectedDocuments.includes(doc.id) 
          ? { ...doc, status: 'rejected', rejectionReason: 'Bulk rejection' }
          : doc
      ));
    }
    
    setSelectedDocuments([]);
    setBulkAction('');
  };

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedDocuments(
      selectedDocuments.length === filteredDocuments.length 
        ? [] 
        : filteredDocuments.map(doc => doc.id)
    );
  };

  const filteredDocuments = documents.filter(doc => {
    const statusMatch = filterStatus === 'all' || doc.status === filterStatus;
    const typeMatch = filterType === 'all' || doc.type === filterType;
    return statusMatch && typeMatch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (!user || !['hr', 'super_admin'].includes(user.role)) {
    return null;
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600 mt-1">
              Review and manage all user documents
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => alert('Export functionality coming soon!')}
              className="btn-secondary"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="input"
                >
                  <option value="all">All Types</option>
                  <option value="passport">Passport</option>
                  <option value="diploma">Diploma</option>
                  <option value="transcript">Transcript</option>
                  <option value="visa">Visa</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Action
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="input"
                >
                  <option value="">Select Action</option>
                  <option value="verify">Verify Selected</option>
                  <option value="reject">Reject Selected</option>
                  <option value="review">Mark Under Review</option>
                </select>
              </div>

              <div>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || selectedDocuments.length === 0}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply ({selectedDocuments.length})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Documents Table */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Documents ({filteredDocuments.length})
              </h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                  onChange={toggleSelectAll}
                  className="mr-2 rounded"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="table-header-cell">User</th>
                  <th className="table-header-cell">Document</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Size</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Uploaded</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="table-row">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={() => toggleDocumentSelection(document.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {document.userInfo.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {document.userInfo.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {document.userInfo.department} • {document.userInfo.nationality}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {document.originalName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {document.fileName}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="capitalize text-sm text-gray-900">
                        {document.type}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-gray-900">
                      {formatFileSize(document.size)}
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(document.status)}
                      {document.status === 'rejected' && document.rejectionReason && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                          {document.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="table-cell text-sm text-gray-900">
                      {formatDate(document.uploadedAt)}
                      {document.verifiedAt && (
                        <div className="text-xs text-green-600">
                          Verified: {formatDate(document.verifiedAt)}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <select
                          value={document.status}
                          onChange={(e) => handleStatusChange(document.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button
                          onClick={() => alert(`Viewing document: ${document.originalName}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                No documents match the current filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
