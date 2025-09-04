import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import DocumentUpload from '../../components/DocumentUpload';

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  const handleUploadSuccess = (document: any) => {
    setSuccessMessage(`Document "${document.originalName}" uploaded successfully!`);
    setError('');
    
    // Redirect to documents page after 2 seconds
    setTimeout(() => {
      router.push('/documents');
    }, 2000);
  };

  const handleUploadError = (error: string) => {
    setError(error);
    setSuccessMessage('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
          <p className="text-gray-600 mt-2">
            Upload a new document for verification
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
            <p className="text-sm text-green-600 mt-1">Redirecting to documents page...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Upload Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Document Details</h3>
            <p className="text-sm text-gray-500">Please fill in the information below</p>
          </div>
          <div className="card-body">
            <DocumentUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        </div>

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
