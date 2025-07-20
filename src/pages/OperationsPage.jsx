import { useState, useEffect, Fragment, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LightBulbIcon,
  ChevronUpDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';
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

// A helper for dynamic class names with Headless UI
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const OperationsPage = () => {
  const navigate = useNavigate();
  const [operations, setOperations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  // Removed unused state variables

  const fetchOperations = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getOperations({
        page: pagination.page,
        limit: pagination.limit,
        type: selectedType === 'all' ? undefined : selectedType,
        search: searchQuery || undefined
      });

      // Handle the API response structure: { success, data, pagination }
      const operationsData = response.data && Array.isArray(response.data) ? response.data : [];
      const paginationData = response.pagination || {};

      setOperations(operationsData);

      // Update pagination with data from the API response
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 1,
        hasNextPage: paginationData.hasNextPage || false,
        hasPreviousPage: paginationData.hasPreviousPage || false
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch operations');
      console.error('Error fetching operations:', err);
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedType, searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [selectedType, searchQuery]);

  // Fetch operations when pagination or filters change
  useEffect(() => {
    fetchOperations();
  }, [pagination.page, pagination.limit, selectedType, searchQuery, fetchOperations]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this operation?')) {
      try {
        await deleteOperation(id);
        // Refresh the current page after deletion
        fetchOperations();
      } catch (err) {
        setError(err.message || 'Failed to delete operation');
      }
    }
  };

  const handleDownload = (operation) => {
    if (operation.type === 'text-to-speech' || operation.type === 'pdf-to-speech') {
      // For audio files - use the audioFile URL if available
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
      } else {
        console.error('No audio file available for download');
        // Fallback to resultUrl if audioFile is not available (for backward compatibility)
        if (operation.resultUrl) {
          const link = document.createElement('a');
          link.href = operation.resultUrl;
          link.download = `audio_${operation.id}.mp3`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('No audio file available for download');
        }
      }
    } else {
      // For text results
      const content = operation.output || operation.result || 'No content available';
      const blob = new Blob([content], { type: 'text/plain' });
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

  // Use operations directly since filtering is now handled by the API
  const filteredOperations = operations;

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
                <Listbox value={selectedType} onChange={setSelectedType}>
                  {({ open }) => (
                    <div className="relative w-64">
                      <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <span className="flex items-center">
                          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                          <span className="block truncate">
                            {operationTypes.find(t => t.id === selectedType)?.name || 'Filter by type'}
                          </span>
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {operationTypes.map((type) => (
                            <Listbox.Option
                              key={type.id}
                              className={({ active }) =>
                                classNames(
                                  active ? 'text-white bg-indigo-600' : 'text-gray-900',
                                  'cursor-default select-none relative py-2 pl-3 pr-9'
                                )
                              }
                              value={type.id}
                            >
                              {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                      {type.name}
                                    </span>
                                  </div>
                                  {selected ? (
                                    <span
                                      className={classNames(
                                        active ? 'text-white' : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  )}
                </Listbox>
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
                <li key={operation.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getOperationIcon(operation.type)}
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate" onClick={() => navigate(`/operations/${operation.id}`)}>
                            {operationTypes.find(t => t.id === operation.type)?.name || 'Operation'}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{formatDate(operation.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {(operation.type === 'text-to-speech' || operation.type === 'pdf-to-speech') && (
                          <button
                            type="button"
                            onClick={() => handleDownload(operation)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            title="Download audio file"
                          >
                            <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                            Download
                          </button>
                        )}
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
                            {operation.input?.substring(0, 100) || 'No input text available'}
                            {operation.input?.length > 100 ? '...' : ''}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pagination.total > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                  disabled={!pagination.hasPreviousPage}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNextPage}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                      disabled={!pagination.hasPreviousPage}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
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