import React, { useState, useRef } from 'react';

const PDFSummaryPage = () => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsLoading(true);
    setSummary('');
    setError('');
    
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:3000/api/pdf/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setSummary(data.summary || "Summary generated successfully!");
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to generate summary. Please try again.');
      setSummary('');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">PDF Summary Generator</h1>
        <p className="text-gray-600">
          Upload your PDF documents and get concise AI-powered summaries instantly
        </p>
      </div>

      {/* Upload Section */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-8 cursor-pointer transition-all
          ${isLoading ? 'border-gray-300 bg-gray-50' : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'}`}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          onChange={handleUpload}
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="mb-4">
          <div className="inline-block bg-blue-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>
        
        <p className="text-lg font-medium text-gray-700 mb-2">
          {fileName || "Click to select a PDF file"}
        </p>
        
        <p className="text-gray-500 mb-4">
          {fileName ? "Click to change file" : "or drag and drop your PDF here"}
        </p>
        
        <button 
          className={`px-5 py-2 rounded-md font-medium ${
            isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Select PDF'}
        </button>
      </div>

      {/* Status Indicators */}
      {isLoading && (
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600">Analyzing your document...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {summary && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Document Summary</h2>
            <p className="text-sm text-gray-500 mt-1">Based on {fileName}</p>
          </div>
          
          <div className="p-6">
            <div className="prose prose-blue max-w-none">
              {summary.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                className="flex items-center text-blue-500 hover:text-blue-700 font-medium"
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                  alert('Summary copied to clipboard!');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-10 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How to use PDF Summary</h3>
        <ul className="list-disc pl-5 space-y-2 text-blue-700">
          <li>Upload any PDF document (research papers, textbooks, articles)</li>
          <li>Our AI will analyze and extract key information</li>
          <li>Receive a concise summary of the main points</li>
          <li>Copy the summary for your notes or reference</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFSummaryPage;