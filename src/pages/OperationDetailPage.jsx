import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOperation } from '../utils/api';
import { format } from 'date-fns';
import { FaArrowLeft, FaSpinner, FaDownload, FaCopy } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

const OperationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOperation = async () => {
      try {
        setLoading(true);
        const response = await getOperation(id);
        
        // The API returns { success: boolean, data: operationData }
        if (!response.success || !response.data) {
          throw new Error('No operation data received');
        }
        
        // Parse the output and metadata if they are strings
        const operationData = {
          ...response.data,
          output: response.data.output ? (
            typeof response.data.output === 'string' 
              ? (() => {
                  try {
                    // Try to parse as JSON first
                    return JSON.parse(response.data.output);
                  } catch (parseError) {
                    // If JSON parsing fails, return the string as-is
                    console.log('Output is not JSON, treating as plain text:', parseError.message);
                    return response.data.output;
                  }
                })()
              : response.data.output
          ) : null,
          metadata: response.data.metadata ? (
            typeof response.data.metadata === 'string' 
              ? (() => {
                  try {
                    return JSON.parse(response.data.metadata);
                  } catch (parseError) {
                    // If JSON parsing fails, return the string as-is
                    console.log('Metadata is not JSON, treating as plain text:', parseError.message);
                    return response.data.metadata;
                  }
                })()
              : response.data.metadata
          ) : null
        };
        
        setOperation(operationData);
        setError('');
      } catch (err) {
        console.error('Error fetching operation:', err);
        setError(err.message || 'Failed to load operation details. Please try again later.');
        setOperation(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOperation();
    } else {
      setError('No operation ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading operation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" /> Back to Operations
          </button>
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Operation not found</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <FaArrowLeft className="inline mr-2" /> Back to Operations
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    // Ensure status is a string and handle undefined/null cases
    const statusStr = String(status || 'unknown').toLowerCase();
    
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      unknown: 'bg-gray-100 text-gray-800',
    };

    // Get the display text by capitalizing the first letter
    const displayText = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[statusStr] || statusClasses.unknown}`}
      >
        {displayText}
      </span>
    );
  };

  const handleDownload = () => {
    // Priority 1: Audio file for speech operations
    if (operation.audioFile && operation.audioFile.url) {
      const link = document.createElement('a');
      // Ensure the URL is absolute
      const audioUrl = operation.audioFile.url.startsWith('http')
        ? operation.audioFile.url
        : `${window.location.origin}${operation.audioFile.url}`;
      
      link.href = audioUrl;
      // Use the original filename if available, otherwise generate one
      const fileName = operation.audioFile.originalName || `audio_${operation.id}.mp3`;
      link.download = fileName.endsWith('.mp3') ? fileName : `${fileName}.mp3`;
      link.target = '_blank'; // Open in new tab for audio preview
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Priority 2: PDF file if pdfUrl is available
    if (operation.pdfUrl) {
      const link = document.createElement('a');
      const pdfUrl = operation.pdfUrl.startsWith('http')
        ? operation.pdfUrl
        : `${window.location.origin}${operation.pdfUrl}`;
      
      link.href = pdfUrl;
      link.download = `${operation.type}_${operation.id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Priority 3: Text output as fallback
    if (operation.output) {
      let content = '';
      if (Array.isArray(operation.output)) {
        content = operation.output.join('\n');
      } else {
        content = String(operation.output);
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${operation.type}_${operation.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // No downloadable content available
    alert('No downloadable content available for this operation.');
  };

  const handleCopy = async () => {
    if (!operation.output) return;
    
    let content = '';
    if (Array.isArray(operation.output)) {
      content = operation.output.join('\n');
    } else {
      content = String(operation.output);
    }
    
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy content:', err);
      alert('Failed to copy content to clipboard');
    }
  };

  const getDownloadInfo = () => {
    if (operation.audioFile && operation.audioFile.url) {
      return { text: 'Download Audio', title: 'Download audio file' };
    }
    if (operation.pdfUrl) {
      return { text: 'Download PDF', title: 'Download PDF file' };
    }
    if (operation.output) {
      return { text: 'Download Text', title: 'Download as text file' };
    }
    return { text: 'Download', title: 'No downloadable content available' };
  };

  // Helper function to detect if content looks like markdown
  const isMarkdownContent = (content) => {
    if (typeof content !== 'string') return false;
    
    // Check for common markdown patterns
    const markdownPatterns = [
      /\*\*.*?\*\*/,  // Bold text
      /\*.*?\*/,      // Italic text
      /^#{1,6}\s/m,   // Headers
      /^\*\s/m,       // Bullet points
      /^\d+\.\s/m,    // Numbered lists
      /\[.*?\]\(.*?\)/, // Links
      /`.*?`/,        // Inline code
      /```[\s\S]*?```/ // Code blocks
    ];
    
    return markdownPatterns.some(pattern => pattern.test(content));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Operations
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Operation Details</h1>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Status:</span>
              {getStatusBadge(operation.status)}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Created at: {formatDate(operation.createdAt)}
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {operation.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Input</h4>
              <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {operation.input || 'No input provided'}
              </div>
            </div>

            {operation.output && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    {operation.type === 'key-points' ? 'Key Points' : 'Output'}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Copy to clipboard"
                    >
                      <FaCopy className="mr-1" />
                      Copy
                    </button>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title={getDownloadInfo().title}
                    >
                      <FaDownload className="mr-1" />
                      {getDownloadInfo().text}
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  {Array.isArray(operation.output) ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {operation.output.map((point, index) => (
                        <li key={index} className="text-sm text-gray-900">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                // Custom styling for markdown elements
                                h1: ({children}) => <h1 className="text-sm font-semibold mb-1">{children}</h1>,
                                h2: ({children}) => <h2 className="text-sm font-medium mb-1">{children}</h2>,
                                h3: ({children}) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                                p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
                                ul: ({children}) => <ul className="list-disc pl-3 mb-1">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal pl-3 mb-1">{children}</ol>,
                                li: ({children}) => <li className="mb-0.5">{children}</li>,
                                code: ({children}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                pre: ({children}) => <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto mb-1">{children}</pre>,
                                blockquote: ({children}) => <blockquote className="border-l-2 border-gray-300 pl-2 italic mb-1">{children}</blockquote>,
                                strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                em: ({children}) => <em className="italic">{children}</em>,
                              }}
                            >
                              {point}
                            </ReactMarkdown>
                          </div>
                        </li>
                      ))}
                    </ul>) : (
                    <div className="text-sm text-gray-900">
                      {isMarkdownContent(operation.output) ? (
                        <ReactMarkdown 
                          components={{
                            // Custom styling for markdown elements
                            h1: ({children}) => <h1 className="text-lg font-bold mb-3 text-gray-900">{children}</h1>,
                            h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-gray-900">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-medium mb-2 text-gray-900">{children}</h3>,
                            p: ({children}) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                            ul: ({children}) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                            li: ({children}) => <li className="text-gray-700 leading-relaxed">{children}</li>,
                            code: ({children}) => <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono text-gray-800">{children}</code>,
                            pre: ({children}) => <pre className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto mb-3 border">{children}</pre>,
                            blockquote: ({children}) => <blockquote className="border-l-4 border-blue-300 pl-4 italic mb-3 text-gray-600">{children}</blockquote>,
                            strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                            a: ({href, children}) => (
                              <a 
                                href={href} 
                                className="text-blue-600 hover:text-blue-800 underline" 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            // Handle line breaks better
                            br: () => <br className="mb-2" />,
                          }}
                        >
                          {operation.output}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                          {operation.output}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {operation.metadata && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Metadata</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    {Object.entries(operation.metadata).map(([key, value]) => (
                      <div key={key} className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 break-words">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationDetailPage;
