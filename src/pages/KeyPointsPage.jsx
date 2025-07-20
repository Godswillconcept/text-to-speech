import { useReducer, Fragment } from 'react';
import { Tab, Listbox } from '@headlessui/react';
import { 
  DocumentArrowUpIcon, 
  LanguageIcon, 
  LightBulbIcon,
  CheckIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline';

import { useApi } from '../hooks/useApi.js';
import { getKeyPointsFromText, getKeyPointsFromPdf } from '../utils/api';
import { keyPointsReducer, keyPointsInitialState, keyPointsActions } from '../reducers/keyPointsReducer.js';
import { API_BASE_URL } from '../config/api.js';
import TextInput from '../components/TextInput';
import DocumentUploader from '../components/DocumentUploader';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}


const KeyPointsPage = () => {
  const [state, dispatch] = useReducer(keyPointsReducer, keyPointsInitialState);
  const { inputText, file, selectedCount, result } = state;
  const { keyPoints, pdfUrl } = result;

  const { isLoading: isTextLoading, error: textError, request: extractFromText } = useApi(getKeyPointsFromText);
  const { isLoading: isFileLoading, error: fileError, request: extractFromFile, clearError: clearFileError } = useApi(getKeyPointsFromPdf);

  const isLoading = isTextLoading || isFileLoading;
  const error = textError || fileError;

  const handleExtract = async (tabIndex) => {
    // Reset the result state
    dispatch(keyPointsActions.clearResult());
    
    let apiResult;
    try {
      if (tabIndex === 0) {
        if (!inputText.trim()) return;
        apiResult = await extractFromText({ 
          text: inputText,
          count: selectedCount 
        });
      } else {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('count', selectedCount);
        apiResult = await extractFromFile(formData);
      }
      
      // Update the result state with the API response
      if (apiResult) {
        dispatch(keyPointsActions.setResult({
          keyPoints: apiResult.keyPoints || [],
          pdfUrl: apiResult.pdfUrl || null,
          operationId: apiResult.operationId || null
        }));
      }
    } catch (err) {
      console.error('Error extracting key points:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Key Points Extractor</h1>
        <p className="mt-4 text-lg text-gray-600">Instantly pull the most important ideas from any text or document.</p>
      </div>

      <Tab.Group>

        {({ selectedIndex }) => (
          <>
            {/* Input Tab Section */}
            <Tab.List className="flex space-x-1 rounded-xl bg-green-900/20 p-1 max-w-md mx-auto">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white/60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-green-700 shadow'
                      : 'text-green-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <LanguageIcon className="mr-2 h-5 w-5" />
                  From Text
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white/60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-green-700 shadow'
                      : 'text-green-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <DocumentArrowUpIcon className="mr-2 h-5 w-5" />
                  From Document
                </div>
              </Tab>
            </Tab.List>

            <div className="mt-6 space-y-6">
              {/* Input Section */}
              <Tab.Panels>
                <Tab.Panel className="space-y-4">
                  <TextInput
                    value={inputText}
                    onChange={(text) => dispatch(keyPointsActions.setInputText(text))}
                    placeholder="Paste your text here..."
                    multiline
                    rows={8}
                    className="w-full"
                  />
                </Tab.Panel>
                <Tab.Panel>
                  <DocumentUploader
                    onFileChange={(file) => dispatch(keyPointsActions.setFile(file))}
                    file={file}
                    onClear={() => {
                      dispatch(keyPointsActions.clearFile());
                      clearFileError();
                    }}
                  />
                </Tab.Panel>
              </Tab.Panels>

              {/* Count Selection */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                  <label htmlFor="count-select" className="text-sm font-medium text-gray-700">
                    Number of key points to extract:
                  </label>
                  <TextInput
                    value={selectedCount}
                    onChange={(value) => dispatch(keyPointsActions.setSelectedCount(Number(value)))}
                    placeholder="Number of key points to extract"
                    className="w-full"
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                  />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleExtract(selectedIndex)}
                  disabled={isLoading || (selectedIndex === 0 ? !inputText.trim() : !file)}
                  className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <LightBulbIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Extracting...' : 'Extract Key Points'}
                </button>
              </div>
            </div>

            {/* Output Tab Panel Section */}
            {(keyPoints?.length > 0 || isLoading || error) && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Extracted Key Points</h3>
                  {pdfUrl && (
                    <a 
                      href={`${API_BASE_URL}${pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                      Download PDF
                    </a>
                  )}
                </div>
                <div className="mt-2 min-h-[200px] rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5">
                  {isLoading && (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin h-5 w-5 text-green-600">
                        <LightBulbIcon className="h-5 w-5" />
                      </div>
                      <p className="text-gray-700">Finding the key points. This may take a moment...</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {error.includes('unavailable') || error.includes('overloaded') 
                              ? 'AI Service Temporarily Unavailable' 
                              : 'Error Processing Request'}
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                            {(error.includes('unavailable') || error.includes('overloaded') || error.includes('traffic')) && (
                              <p className="mt-2">
                                Please try again in a few moments. If the issue persists, you can try again later or contact support.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isLoading && !error && keyPoints.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center text-green-600">
                        <LightBulbIcon className="h-5 w-5 mr-2" />
                        <h4 className="font-medium">Here are the key points I found:</h4>
                      </div>
                      <ul className="space-y-3 pl-5">
                        {keyPoints.map((point, index) => (
                          <li key={index} className="relative pl-3 text-gray-800 before:absolute before:left-0 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-green-600">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {!isLoading && !error && keyPoints.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p>No key points extracted yet. Enter some text or upload a document to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Tab.Group>
    </div>
  );
};

export default KeyPointsPage;