import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

// Hardcode backend URL to avoid undefined issues
const VITE_API_URL = 'https://studybuddy-backend-8smv.onrender.com';

const PDFUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string>('');

  console.log('[PDFUploader] VITE_API_URL:', VITE_API_URL);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.size > 500 * 1024) {
        setError('File too large (max 500KB)');
        toast.error('File too large');
        return;
      }
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files allowed');
        toast.error('Only PDF files allowed');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('No file selected');
      toast.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('[PDFUploader] Uploading to:', `${VITE_API_URL}/api/pdf/upload`, {
        fileName: file.name,
        fileSize: file.size / 1024 + 'KB'
      });
      const response = await fetch(`${VITE_API_URL}/api/pdf/upload`, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      console.log('[PDFUploader] Raw response:', text);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${text}`);
      }

      try {
        const data = JSON.parse(text);
        setSummary(data.summary || 'No summary returned');
        toast.success('PDF summarized successfully!');
      } catch (jsonError) {
        console.error('[PDFUploader] JSON parse error:', jsonError, 'Raw text:', text);
        throw new Error('Invalid server response');
      }
    } catch (err: any) {
      console.error('[PDFUploader] Error:', err.message);
      setError(err.message || 'Failed to summarize PDF');
      toast.error('Failed to summarize PDF');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload PDF</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>Upload</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {summary && <p>Summary: {summary}</p>}
    </div>
  );
};

export default PDFUploader;