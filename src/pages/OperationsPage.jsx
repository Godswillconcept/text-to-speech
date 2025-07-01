import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  DocumentTextIcon, 
  SpeakerWaveIcon, 
  PencilIcon, 
  DocumentMagnifyingGlassIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { getOperations, deleteOperation } from '../utils/api';

const operationTypes = [
  { id: 'all', name: 'All Types' },
  { id: 'text-to-speech', name: 'Text to Speech', icon: SpeakerWaveIcon, color: 'bg-indigo-100 text-indigo-800' },
  { id: 'pdf-to-speech', name: 'PDF to Speech', icon: DocumentTextIcon, color: 'bg-purple-100 text-purple-800' },
  { id: 'paraphrase', name: 'Paraphrase', icon: PencilIcon, color: 'bg-green-100 text-green-800' },
  { id: 'summarize', name: 'Summarize', icon: DocumentMagnifyingGlassIcon, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'change-tone', name: 'Change Tone', icon: SparklesIcon, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'key-points', name: 'Key Points', icon: LightBulbIcon, color: 'bg-blue-100 text-blue-800' },
  { id: 'document-paraphrase', name: 'Document Paraphrase', icon: DocumentTextIcon, color: 'bg-green-100 text-green-800' },
  { id: 'document-summarize', name: 'Document Summarize', icon: DocumentMagnifyingGlassIcon, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'document-key-points', name: 'Document Key Points', icon: LightBulbIcon, color: 'bg-blue-100 text-blue-800' },
  { id: 'document-change-tone', name: 'Document Change Tone', icon: SparklesIcon, color: 'bg-yellow-100 text-yellow-800' },

];

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const OperationsPage = () => {
  const [operations, setOperations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOperations = async () => {
      setIsLoading(true);
      try {
        const response = await getOperations({
          page: currentPage,
          limit: itemsPerPage,
          type: selectedType !== 'all' ? selectedType : undefined,
          search: searchQuery || undefined,
        });
        setOperations(response.data);
        setTotalPages(Math.ceil(response.total / itemsPerPage));
      } catch (err) {
        console.error('Error fetching operations:', err);
        setError('Failed to load operations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperations();
  }, [currentPage, selectedType, searchQuery]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this operation?')) {
      try {
        await deleteOperation(id);
        setOperations(operations.filter(op => op.id !== id));
      } catch (err) {
        console.error('Error deleting operation:', err);
        setError('Failed to delete operation. Please try again.');
      }
    }
  };

  const handleDownload = (operation) => {
    if (operation.type === 'text-to-speech' || operation.type === 'pdf-to-speech') {
      // For audio files
      const link = document.createElement('a');
      link.href = operation.resultUrl;
      link.download = `audio_${operation.id}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For text results
      const blob = new Blob([operation.result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${operation.type}_${operation.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getOperationIcon = (type) => {
    const opType = operationTypes.find(t => t.id === type);
    const Icon = opType ? opType.icon : DocumentTextIcon;
    const color = opType ? opType.color : 'bg-gray-100 text-gray-800';
    
    return (
      <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  };

  const filteredOperations = operations.filter(operation => {
    const matchesSearch = operation.inputText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       operation.result?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || operation.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Operation History
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              View and manage your past operations
            </p>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative rounded-md shadow-sm w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Search operations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {operationTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
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
          ) : operations.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No operations</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedType !== 'all' 
                  ? 'No operations match your search criteria.'
                  : 'Get started by creating a new operation.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOperations.map((operation) => (
                <li key={operation.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getOperationIcon(operation.type)}
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {operationTypes.find(t => t.id === operation.type)?.name || 'Operation'}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{formatDate(operation.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(operation)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(operation.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <TrashIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="truncate">
                            {operation.inputText?.substring(0, 100)}
                            {operation.inputText?.length > 100 ? '...' : ''}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, operations.length)}
                    </span>{' '}
                    of <span className="font-medium">{operations.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationsPage;