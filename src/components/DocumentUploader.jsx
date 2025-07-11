import React, { useCallback, useState, useRef } from 'react';
import { DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DocumentUploader = ({ 
  file, 
  onFileChange, 
  className = '',
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.ppt', '.pptx'],
  acceptedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  maxSizeMB = 10,
  label = 'Upload a document'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const dragCounterRef = useRef(0);

  // Helper function to validate file
  const validateFile = useCallback((file) => {
    if (!file) return { isValid: false, error: 'No file selected' };
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }
    
    // Check file type
    const isValidType = acceptedMimeTypes.includes(file.type) || 
                       acceptedTypes.some(type => file.name.toLowerCase().endsWith(type.toLowerCase()));
    
    if (!isValidType) {
      return { isValid: false, error: `Please select a valid document type: ${acceptedTypes.join(', ')}` };
    }
    
    return { isValid: true, error: '' };
  }, [acceptedTypes, acceptedMimeTypes, maxSizeMB]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (!isDragging) {
      setIsDragging(true);
      setError('');
    }
  }, [isDragging]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validation = validateFile(droppedFile);
      if (validation.isValid) {
        setError('');
        onFileChange(droppedFile);
      } else {
        setError(validation.error);
      }
    }
  }, [onFileChange, validateFile]);

  const handleChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validation = validateFile(selectedFile);
      if (validation.isValid) {
        setError('');
        onFileChange(selectedFile);
      } else {
        setError(validation.error);
      }
    }
  }, [onFileChange, validateFile]);

  const handleRemove = useCallback(() => {
    onFileChange(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onFileChange]);

  const handleClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, []);

  // Get file type display name
  const getFileTypeDisplay = useCallback((fileName) => {
    const extension = fileName.split('.').pop()?.toUpperCase();
    return extension || 'Document';
  }, []);

  return (
    <div className={className}>
      <div 
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!file ? handleClick : undefined}
      >
        <div className="space-y-1 text-center">
          {file ? (
            <div className="flex flex-col items-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">
                {getFileTypeDisplay(file.name)} • {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={handleRemove}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Remove
              </button>
            </div>
          ) : (
            <>
              <DocumentTextIcon className={`mx-auto h-12 w-12 ${error ? 'text-red-400' : 'text-gray-400'}`} />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>{label}</span>
                  <input
                    ref={inputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept={acceptedTypes.join(',')}
                    onChange={handleChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                {acceptedTypes.join(', ').toUpperCase()} up to {maxSizeMB}MB
              </p>
              {error && (
                <p className="text-xs text-red-600 mt-2">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;