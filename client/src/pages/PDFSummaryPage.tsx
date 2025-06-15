import React, { useState, useRef } from 'react';
import { FileText, Loader2, Copy, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PDFSummaryPage = () => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Selected file:', file.name, (file.size / 1024).toFixed(2) + 'KB');

    // Enhanced validation
    if (!file.name.endsWith('.pdf')) {
      setError('Only PDF files are allowed');
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      toast.error('File too large (max 10MB)');
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setError('');
    setSummary('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      console.log('Uploading file to server...');
      const response = await fetch('http://localhost:3000/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      console.log('Received summary:', data.summary.length, 'characters');
      setSummary(data.summary);
      toast.success(`Summary generated for ${file.name}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
      console.error('Upload error:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success('Summary copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const triggerFileInput = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">PDF Summary Generator</h1>
        <p className="text-gray-600">
          Upload PDF documents (max 10MB) to get AI-powered summaries
        </p>
      </div>

      {/* Upload Section */}
      <div 
        className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center mb-6 transition-all
          ${isLoading 
            ? 'border-gray-300 bg-gray-50 cursor-wait' 
            : error 
              ? 'border-red-300 bg-red-50 cursor-pointer'
              : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
          }`}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          name="pdf"  // Important for multer
          accept=".pdf,application/pdf"
          onChange={handleUpload}
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center">
          {isLoading ? (
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-3" />
          ) : error ? (
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          ) : (
            <FileText className="h-10 w-10 text-blue-500 mb-3" />
          )}
          
          <p className={`font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}>
            {fileName || 'Click to select PDF'}
          </p>
          <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'} mt-1`}>
            {error || (fileName ? 'Click to change file' : 'Supports .pdf files up to 10MB')}
          </p>
        </div>
      </div>

      {/* Results Section */}
      {summary && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Document Summary</h2>
              <p className="text-sm text-gray-500 mt-1">{fileName}</p>
            </div>
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium text-sm"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
          
          <div className="p-6">
            <div className="prose max-w-none">
              {summary.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0 text-gray-700">
                  {paragraph || <br />}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFSummaryPage;