import { useState, useCallback } from 'react';

type DocumentType = 'CV' | 'ID_PASSPORT' | 'ERASMUS_FORMS' | 'INTERNSHIP_AGREEMENT' | 'INSURANCE' | 'ACCEPTANCE_LETTER' | 'LEARNING_AGREEMENT' | 'FINAL_REPORT' | 'PROFILE_PICTURE' | 'OTHER';

interface InternDocument {
  id: number;
  internId: number;
  documentType: DocumentType;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  uploadDate: string;
  verificationDate?: string;
  verifiedBy?: number;
  comments?: string;
}

interface DocumentUploadProps {
  onUploadSuccess?: (document: InternDocument) => void;
  onUploadError?: (error: string) => void;
}

const DocumentUploadArea = ({ onUploadSuccess, onUploadError }: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('CV');
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'CV', label: 'Curriculum Vitae (CV)' },
    { value: 'ID_PASSPORT', label: 'ID / Passport' },
    { value: 'ERASMUS_FORMS', label: 'Erasmus+ Forms' },
    { value: 'INTERNSHIP_AGREEMENT', label: 'Internship Agreement' },
    { value: 'INSURANCE', label: 'Insurance Documents' },
    { value: 'ACCEPTANCE_LETTER', label: 'Acceptance Letter' },
    { value: 'LEARNING_AGREEMENT', label: 'Learning Agreement' },
    { value: 'FINAL_REPORT', label: 'Final Report' },
    { value: 'PROFILE_PICTURE', label: 'Profile Picture' },
    { value: 'OTHER', label: 'Other Document' },
  ];

  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onUploadError?.('File too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
  }, [onUploadError]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError?.('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUploadSuccess?.(data.document);
        setSelectedFile(null);
        setNotes('');
        setUploadProgress(0);
      } else {
        const errorData = await response.json();
        onUploadError?.(errorData.error || 'Upload failed. Please try again.');
      }
    } catch (error: any) {
      onUploadError?.(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          className="input"
          disabled={isUploading}
        >
          {documentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload File
        </label>
        <div
          className={`upload-area ${dragActive ? 'dragover' : ''} ${isUploading ? 'opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{selectedFile.name}</div>
                  <div className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>

              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  className="btn-secondary text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  <label className="cursor-pointer text-primary-600 hover:text-primary-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      disabled={isUploading}
                    />
                  </label>
                  {' '}or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input"
          rows={3}
          placeholder="Add any additional information about this document..."
          disabled={isUploading}
          maxLength={500}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {notes.length}/500 characters
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`btn-primary ${(!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <span className="flex items-center">
              <div className="loading-spinner h-4 w-4 mr-2" />
              Uploading... {uploadProgress}%
            </span>
          ) : (
            'Upload Document'
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentUploadArea;
