import React, { useCallback, useState, useRef } from 'react';
import { DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PdfUploader = ({ file, onFileChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  // Create a ref to hold a reference to the file input element.
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      onFileChange(droppedFile);
    }
  }, [onFileChange]);

  const handleChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  }, [onFileChange]);

  const handleRemove = useCallback(() => {
    onFileChange(null);
    // This is the robust way to clear a file input's value.
    if (inputRef.current) {
      inputRef.current.value = null;
    }
  }, [onFileChange]);

  return (
    <div className={className}>
      <div 
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          {file ? (
            <div className="flex flex-col items-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">{file.name}</p>
              <button
                type="button"
                onClick={handleRemove}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Remove
              </button>
            </div>
          ) : (
            <>
              {/* ... no changes to this part ... */}
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    ref={inputRef} // Attach the ref to the input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf"
                    onChange={handleChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF up to 10MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfUploader;