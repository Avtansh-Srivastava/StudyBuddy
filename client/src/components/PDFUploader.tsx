import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://studybuddy-backend-8smv.onrender.com';
console.log('PDFUploader BACKEND URL:', BACKEND_URL);
console.log('PDFUploader env vars:', import.meta.env);

const PDFUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError('File too large (max 2MB)');
        setFile(null);
        toast.error('File too large');
        return;
      }
      setFile(selectedFile);
      setSummary('');
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file');
      toast.error('No file selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[PDFUploader] Uploading:', file.name, file.size / 1024, 'KB');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BACKEND_URL}/api/pdf/upload`, {
        method: 'POST',
        body: formData
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('[PDFUploader] JSON parse error:', jsonError);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(data.error || `Upload failed: ${response.status}`);
      }

      setSummary(data.summary);
      toast.success('PDF summarized!');
    } catch (err) {
      console.error('[PDFUploader] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to summarize PDF');
      toast.error('PDF summary failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Upload PDF for Summarization</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={isLoading}
        style={{ marginBottom: '10px' }}
      />
      <button
        onClick={handleUpload}
        disabled={!file || isLoading}
        style={{ padding: '10px 20px', marginLeft: '10px' }}
      >
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {summary && (
        <div style={{ marginTop: '20px' }}>
          <h3>Summary</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;