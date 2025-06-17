import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

// Debug VITE_API_URL
const VITE_API_URL = import.meta.env.VITE_API_URL || 'https://studybuddy-backend-8smv.onrender.com';
console.log('PDFUploader BACKEND_URL:', VITE_API_URL);
console.log('PDFUploader env vars:', import.meta.env);

const PDFUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 1 * 1024 * 1024) {
        setError('File too large (max 1MB)');
        setFile(null);
        toast.error('File too large');
        return;
      }
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        setFile(null);
        toast.error('Invalid file type');
        return;
      }
      setFile(selectedFile);
      setSummary(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file');
      toast.error('No file selected');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('[PDFUploader] Uploading:', {
        name: file.name,
        sizeKB: file.size / 1024
      });
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${VITE_API_URL}/api/pdf/upload`, {
        method: 'POST',
        body: formData
      });

      let data;
      try {
        const text = await response.text();
        console.log('[PDFUploader] Response text:', text.substring(0, 200) + '...');
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('[PDFUploader] JSON parse error:', jsonError);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(data.error || `Upload failed: ${response.status}`);
      }

      setSummary(data.summary);
      toast.success('PDF summarized successfully!');
    } catch (err) {
      console.error('[PDFUploader] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to summarize PDF');
      toast.error('PDF summarization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Upload PDF for Summarization</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={isProcessing}
        style={{ marginBottom: '10px' }}
      />
      <button
        onClick={handleUpload}
        disabled={!file || isProcessing}
        style={{ padding: '10px 20px', marginLeft: '10px' }}
      >
        {isProcessing ? 'Processing...' : 'Upload PDF'}
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