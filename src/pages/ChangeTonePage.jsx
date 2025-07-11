import { useState, Fragment } from 'react';
import { Tab, Listbox } from '@headlessui/react';
import { DocumentArrowUpIcon, LanguageIcon, SparklesIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

import { useApi } from '../hooks/useApi.js';
import { changeToneOfText, changeToneOfPdf } from '../utils/api.js';
import TextInput from '../components/TextInput';
import DocumentUploader from '../components/DocumentUploader';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ChangeTonePage = () => {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [tone, setTone] = useState('professional');
  const [tonedText, setTonedText] = useState('');

  const { 
    isLoading: isTextLoading, 
    error: textError, 
    request: changeToneFromText,
    clearError: clearTextError 
  } = useApi(changeToneOfText);
  
  const { 
    isLoading: isFileLoading, 
    error: fileError, 
    request: changeToneFromFile,
    clearError: clearFileError 
  } = useApi(changeToneOfPdf);

  const isLoading = isTextLoading || isFileLoading;
  const error = textError || fileError;
  
  // Clear all errors when changing tabs or input
  const clearErrors = () => {
    if (textError) clearTextError();
    if (fileError) clearFileError();
  };

  const handleChangeTone = async (tabIndex) => {
    setTonedText('');
    clearErrors();
    
    try {
      let result;
      if (tabIndex === 0) {
        if (!inputText.trim()) return;
        // Add retry logic with exponential backoff
        result = await withRetry(
          () => changeToneFromText({ text: inputText, tone }),
          3, // max retries
          1000 // initial delay in ms
        );
      } else {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tone', tone);
        // Add retry logic with exponential backoff
        result = await withRetry(
          () => changeToneFromFile(formData),
          3, // max retries
          1000 // initial delay in ms
        );
      }
      
      // Handle the response based on the API structure
      if (result) {
        const tonedText = typeof result === 'object' ? result.result || result.tonedText : result;
        if (tonedText) {
          setTonedText(tonedText);
        } else {
          throw new Error('No text was returned from the server');
        }
      }
    } catch (error) {
      console.error('Error changing tone:', error);
      // The error will be handled by the useApi hook and set in the error state
    }
  };
  
  // Helper function for retrying failed requests with exponential backoff
  const withRetry = async (fn, maxRetries, delay) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error);
        
        // Don't retry for client errors (4xx) except 429 (Too Many Requests)
        if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s, etc.
        if (attempt < maxRetries) {
          const waitTime = delay * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    throw lastError || new Error('Request failed after all retries');
  };

  const tones = [
    { id: 'professional', name: 'Professional' },
    { id: 'casual', name: 'Casual' },
    { id: 'assertive', name: 'Assertive' },
    { id: 'empathetic', name: 'Empathetic' },
    { id: 'formal', name: 'Formal' },
    { id: 'friendly', name: 'Friendly' },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Tone Changer</h1>
        <p className="mt-4 text-lg text-gray-600">Adjust the tone of your message to perfectly match your audience.</p>
      </div>

      <Tab.Group>
        {({ selectedIndex }) => (
          <>
            <Tab.List className="flex space-x-1 rounded-xl bg-yellow-900/20 p-1 max-w-md mx-auto">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white/60 ring-offset-2 ring-offset-yellow-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-yellow-700 shadow'
                      : 'text-yellow-100 hover:bg-white/[0.12] hover:text-white'
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
                    'ring-white/60 ring-offset-2 ring-offset-yellow-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-yellow-700 shadow'
                      : 'text-yellow-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <DocumentArrowUpIcon className="mr-2 h-5 w-5" />
                  From Document
                </div>
              </Tab>
            </Tab.List>

            <Tab.Panels className="mt-6">
              <Tab.Panel>
                <TextInput
                  value={inputText}
                  onChange={setInputText}
                  placeholder="Enter text to change tone..."
                  multiline
                  rows={8}
                />
              </Tab.Panel>
              <Tab.Panel>
                <DocumentUploader
                  acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.rtf', '.ppt', '.pptx']}
                  acceptedMimeTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']}
                  onFileChange={setFile}
                  file={file}
                  onClear={() => {
                    setFile(null);
                    clearFileError();
                  }}
                />
              </Tab.Panel>
            </Tab.Panels>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <Listbox value={tone} onChange={setTone}>
                  {() => (
                    <>
                      <Listbox.Label className="block text-sm font-medium text-gray-700">New Tone</Listbox.Label>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 sm:text-sm">
                          <span className="block truncate">{tones.find(t => t.id === tone)?.name}</span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {tones.map((t) => (
                            <Listbox.Option
                              key={t.id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-yellow-100 text-yellow-900' : 'text-gray-900'
                                }`
                              }
                              value={t.id}
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                    {t.name}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </>
                  )}
                </Listbox>
              </div>
              <div className="md:col-span-2 self-end flex justify-end">
                <button type="button" onClick={() => handleChangeTone(selectedIndex)} disabled={isLoading} className="inline-flex items-center justify-center rounded-md bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 disabled:bg-yellow-200">
                  <SparklesIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isLoading && 'animate-spin'}`} />
                  {isLoading ? 'Adjusting...' : 'Change Tone'}
                </button>
              </div>
            </div>

            {(tonedText || isLoading || error) && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Result</h3>
                <div className="mt-2 min-h-[200px] rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5 whitespace-pre-wrap">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                      <p className="text-gray-500">Adjusting the tone of your text...</p>
                      <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error processing your request</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error.message || error}</p>
                            {error.status === 503 && (
                              <p className="mt-2">The AI service is currently overloaded. Please try again in a few moments.</p>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                clearErrors();
                                handleChangeTone(0); // 0 for text, 1 for file - this will retry
                              }}
                              className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Try Again
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {tonedText && !isLoading && !error && <p className="whitespace-pre-wrap">{tonedText}</p>}
                </div>
              </div>
            )}
          </>
        )}
      </Tab.Group>
    </div>
  );
};

export default ChangeTonePage;