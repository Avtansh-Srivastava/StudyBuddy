import React, { useState, useRef } from 'react';
import { FileUp, X, AlertCircle } from 'lucide-react';

interface PDFUploaderProps {
  onFileContent: (content: string) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileContent }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetFile = () => {
    setFile(null);
    setError(null);
    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return false;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const simulateFileReading = async () => {
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Mock PDF content extraction (in a real app, we'd use a PDF parser library)
    const mockContent = `This is a sample text extracted from the PDF titled "${file?.name}". 
    In a real application, we would use a PDF parser library to extract the actual text content.
    This document appears to cover academic topics related to various subjects.
    
    The content includes several paragraphs discussing theoretical concepts and practical applications.
    There are references to research studies and empirical data supporting the main arguments.
    
    Several key points are highlighted throughout the document, emphasizing important concepts and methodologies.
    The author provides a comprehensive analysis of the subject matter, drawing on established frameworks.
    
    Charts and figures in the document illustrate statistical trends and comparative analyses.
    The conclusion summarizes the main findings and suggests implications for future research.`;
    
    onFileContent(mockContent);
    setUploading(false);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile && validateFile(droppedFile)) {
              setFile(droppedFile);
            }
          }}
        >
          <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag and drop your PDF here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Max file size: 5MB, text-based PDFs only
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
          >
            Browse files
          </button>
          
          {error && (
            <div className="mt-4 text-error flex items-center gap-2 justify-center">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileUp size={24} className="text-primary-600" />
              <div className="truncate max-w-xs">
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            <button
              onClick={resetFile}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Remove file"
            >
              <X size={20} />
            </button>
          </div>
          
          {uploading ? (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span>Extracting text...</span>
                <span>{uploadProgress}%</span>
              </div>
              <progress 
                className="progress progress-primary w-full" 
                value={uploadProgress} 
                max="100"
              ></progress>
            </div>
          ) : (
            <button
              onClick={simulateFileReading}
              className="btn btn-primary w-full"
            >
              Process PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFUploader;