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
  metadata?: any;
}

export default function ViewDocumentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchDocuments();
    }
  }, [user, authLoading, router]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Demo documents data
      const demoDocuments: Document[] = [
        {
          id: '1',
          fileName: 'passport_john_doe.pdf',
          originalName: 'passport.pdf',
          type: 'passport',
          size: 1024000,
          status: 'verified',
          uploadedAt: '2024-01-15T10:00:00Z',
          verifiedAt: '2024-01-16T14:30:00Z',
          userId: String(user?.id || '1'),
          metadata: { pages: 2 }
        },
        {
          id: '2',
          fileName: 'diploma_john_doe.pdf',
          originalName: 'university_diploma.pdf',
          type: 'diploma',
          size: 2048000,
          status: 'under_review',
          uploadedAt: '2024-01-18T09:15:00Z',
          userId: String(user?.id || '1'),
          metadata: { pages: 1 }
        },
        {
          id: '3',
          fileName: 'transcript_john_doe.pdf',
          originalName: 'official_transcript.pdf',
          type: 'transcript',
          size: 1536000,
          status: 'pending',
          uploadedAt: '2024-01-20T16:45:00Z',
          userId: String(user?.id || '1'),
          metadata: { pages: 4 }
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

  const filteredDocuments = filterStatus === 'all' 
    ? documents 
    : documents.filter(doc => doc.status === filterStatus);

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

  if (!user) {
    return null;
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-600 mt-1">
              View and manage your uploaded documents
            </p>
          </div>
          <button
            onClick={() => router.push('/documents/upload')}
            className="btn-primary"
          >
            Upload New Document
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-4 items-center">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Documents</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all' 
                ? "You haven't uploaded any documents yet."
                : `No documents with status "${filterStatus}".`
              }
            </p>
            <button
              onClick={() => router.push('/documents/upload')}
              className="btn-primary"
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <li key={document.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {document.originalName}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 capitalize">
                            {document.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(document.size)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(document.uploadedAt)}
                          </p>
                        </div>
                        {document.status === 'rejected' && document.rejectionReason && (
                          <p className="text-sm text-red-600 mt-1">
                            Rejection reason: {document.rejectionReason}
                          </p>
                        )}
                        {document.status === 'verified' && document.verifiedAt && (
                          <p className="text-sm text-green-600 mt-1">
                            Verified on {formatDate(document.verifiedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(document.status)}
                      {document.status === 'verified' && (
                        <button
                          className="btn-secondary text-sm"
                          onClick={() => {
                            // Simulate download
                            alert(`Downloading ${document.originalName}...`);
                          }}
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/documents')}
            className="btn-secondary"
          >
            ← Back to Documents
          </button>
        </div>
      </div>
    </Layout>
  );
}
