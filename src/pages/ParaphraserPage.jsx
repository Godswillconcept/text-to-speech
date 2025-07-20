/* eslint-disable no-unused-vars */
import { useReducer, Fragment, useCallback } from 'react';
import { Tab, Listbox, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon, LanguageIcon, ArrowPathIcon, CheckIcon, ChevronUpDownIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

import { useApi } from '../hooks/useApi.js';
import { paraphraseText, paraphrasePdf } from '../utils/api.js';
import { paraphraserReducer, paraphraserInitialState, paraphraserActions } from '../reducers/paraphraserReducer.js';
import TextInput from '../components/TextInput';
import DocumentUploader from '../components/DocumentUploader';

// A helper for dynamic class names with Headless UI
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ParaphraserPage = () => {
  const [state, dispatch] = useReducer(paraphraserReducer, paraphraserInitialState);
  const { inputText, file, outputText, tone, complexity, pdfUrl } = state;
  
  // Two instances of useApi for our two different endpoints
  const { 
    isLoading: isTextLoading, 
    error: textError, 
    request: paraphraseFromText, 
    clearError: clearTextError 
  } = useApi(paraphraseText);
  
  const { 
    isLoading: isFileLoading, 
    error: fileError, 
    request: paraphraseFromFile, 
    clearError: clearFileError 
  } = useApi(paraphrasePdf);

  const isLoading = isTextLoading || isFileLoading;
  const error = textError || fileError;

  const handleDownloadPdf = async () => {
    if (!pdfUrl) return;
    
    try {
      const downloadButton = document.getElementById('download-pdf-button');
      if (downloadButton) {
        downloadButton.disabled = true;
        const originalText = downloadButton.textContent;
        downloadButton.innerHTML = '<span class="flex items-center"><ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />Preparing...</span>';
        
        try {
          // Ensure the URL is absolute by prepending the API base URL if it's a relative path
          const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${pdfUrl}`;
          
          const response = await fetch(fullUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Accept': 'application/pdf'
            },
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
          }
          
          // Get the filename from the Content-Disposition header or generate one
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = `paraphrased_${new Date().toISOString().split('T')[0]}.pdf`;
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, '');
            }
          }
          
          // Convert the response to a blob
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create a temporary anchor element
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
          
        } finally {
          // Restore button state
          if (downloadButton) {
            downloadButton.disabled = false;
            downloadButton.innerHTML = originalText;
          }
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Show error to user (you might want to use a toast notification here)
      alert(`Failed to download PDF: ${error.message}`);
    }
  };

  const handleParaphrase = async (tabIndex) => {
    dispatch(paraphraserActions.clearOutput()); // Clear previous results
    clearTextError();
    clearFileError();
    
    try {
      let result;

      if (tabIndex === 0) { // Paraphrase from Text
        if (!inputText.trim()) {
          clearTextError();
          return;
        }
        
        result = await paraphraseFromText({
          text: inputText,
          tone: tone.toLowerCase(),
          complexity: complexity.toLowerCase(),
        });
        
        // Handle the response format from the backend
        if (result && result.text) {
          dispatch(paraphraserActions.setOutputText(result.text));
          if (result.pdfUrl) dispatch(paraphraserActions.setPdfUrl(result.pdfUrl));
        } else if (result && result.paraphrasedText) {
          dispatch(paraphraserActions.setOutputText(result.paraphrasedText));
          if (result.pdfUrl) dispatch(paraphraserActions.setPdfUrl(result.pdfUrl));
        } else if (result && result.result) {
          dispatch(paraphraserActions.setOutputText(result.result));
          if (result.pdfUrl) dispatch(paraphraserActions.setPdfUrl(result.pdfUrl));
        } else {
          console.error('Unexpected response format:', result);
          throw new Error('Received an unexpected response format from the server');
        }
      } else { // Paraphrase from Document
        if (!file) {
          clearFileError();
          return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tone', tone.toLowerCase());
        formData.append('complexity', complexity.toLowerCase());
        result = await paraphraseFromFile(formData);
        
        // Handle the response format from the backend
        if (result && result.text) {
          dispatch(paraphraserActions.setOutputText(result.text));
          if (result.pdfUrl) dispatch(paraphraserActions.setPdfUrl(result.pdfUrl));
        } else if (result && result.paraphrasedText) {
          dispatch(paraphraserActions.setOutputText(result.paraphrasedText));
          if (result.pdfUrl) dispatch(paraphraserActions.setPdfUrl(result.pdfUrl));
        } else if (result && result.result) {
          dispatch(paraphraserActions.setOutputText(result.result));
          if (result.pdfUrl) dispatch(paraphraserActions.setPdfUrl(result.pdfUrl));
        } else {
          console.error('Unexpected document response format:', result);
          throw new Error('Received an unexpected response format for document processing');
        }
      }
    } catch (error) {
      console.error('Error in handleParaphrase:', error);
      // The error will be handled by the useApi hook and available in textError or fileError
      if (tabIndex === 0) {
        clearTextError();
      } else {
        clearFileError();
      }
    }
  };
  
  const handleTextChange = (text) => {
      dispatch(paraphraserActions.setInputText(text));
      if(textError) clearTextError();
  }

  const handleFileChange = (newFile) => {
      dispatch(paraphraserActions.setFile(newFile));
      if(fileError) clearFileError();
  }

  const tones = [
    { id: 'standard', name: 'Standard' },
    { id: 'neutral', name: 'Neutral' },
    { id: 'formal', name: 'Formal' },
    { id: 'casual', name: 'Casual' },
    { id: 'friendly', name: 'Friendly' },
    { id: 'professional', name: 'Professional' },
    { id: 'academic', name: 'Academic' },
    { id: 'business', name: 'Business' },
  ];

  const complexities = [
    { id: 'simplify', name: 'Simplify' },
    { id: 'maintain', name: 'Maintain' },
    { id: 'enhance', name: 'Enhance' },
  ];
  

  return (
    <div className="mx-auto max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Paraphrase Engine</h1>
        <p className="mt-4 text-lg text-gray-600">Refine your writing by paraphrasing text or entire documents with context and tone.</p>
      </div>

      <Tab.Group onChange={index => { /* Optional: handle tab change logic */ }}>
        {({ selectedIndex }) => (
          <>
            {/* Tab Toggler UI */}
            <Tab.List className="flex space-x-1 rounded-xl bg-indigo-900/20 p-1 max-w-md mx-auto">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button className={classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-indigo-700 shadow' : 'text-gray-700 hover:bg-white/[0.5]')}>
                    <LanguageIcon className="inline h-5 w-5 mr-2" />
                    From Text
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button className={classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-indigo-700 shadow' : 'text-gray-700 hover:bg-white/[0.5]')}>
                    <DocumentArrowUpIcon className="inline h-5 w-5 mr-2" />
                    From Document
                  </button>
                )}
              </Tab>
            </Tab.List>

            {/* Tab Content Panels */}
            <Tab.Panels className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIndex}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tab.Panel className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5">
                    {/* View for "From Text" */}
                    <TextInput multiline rows={10} placeholder="Paste your text here to paraphrase..." value={inputText} onChange={handleTextChange} />
                  </Tab.Panel>

                  <Tab.Panel className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5">
                    {/* View for "From Document" */}
                    <DocumentUploader 
                      file={file} 
                      onFileChange={handleFileChange}
                      acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.rtf', '.ppt', '.pptx']}
                      acceptedMimeTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']}
                      label="Upload Document"
                    />
                  </Tab.Panel>
                </motion.div>
              </AnimatePresence>
            </Tab.Panels>

            {/* Shared Controls and Output */}
            <div className="mt-6 grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tone Selection */}
                <div>
                  <Listbox value={tone} onChange={(tone) => dispatch(paraphraserActions.setTone(tone))} disabled={isLoading}>
                    {({ open }) => (
                      <>
                        <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                          Tone
                        </Listbox.Label>
                        <div className="relative">
                          <Listbox.Button 
                            className={classNames(
                              'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm',
                              'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm',
                              isLoading ? 'bg-gray-50' : ''
                            )}
                          >
                            <span className="block truncate">
                              {tones.find(t => t.id === tone)?.name || 'Select tone'}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {tones.map((toneOption) => (
                                <Listbox.Option
                                  key={toneOption.id}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                    }`
                                  }
                                  value={toneOption.id}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {toneOption.name}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
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
                      </>
                    )}
                  </Listbox>
                </div>

                {/* Complexity Selection */}
                <div>
                  <Listbox value={complexity} onChange={(complexity) => dispatch(paraphraserActions.setComplexity(complexity))} disabled={isLoading}>
                    {({ open }) => (
                      <>
                        <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                          Complexity
                        </Listbox.Label>
                        <div className="relative">
                          <Listbox.Button 
                            className={classNames(
                              'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm',
                              'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm',
                              isLoading ? 'bg-gray-50' : ''
                            )}
                          >
                            <span className="block truncate">
                              {complexities.find(c => c.id === complexity)?.name || 'Select complexity'}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {complexities.map((complexityOption) => (
                                <Listbox.Option
                                  key={complexityOption.id}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                    }`
                                  }
                                  value={complexityOption.id}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {complexityOption.name}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
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
                      </>
                    )}
                  </Listbox>
                </div>
              </div>

              <div className="md:col-span-2 self-end flex justify-end">
                <button 
                  type="button" 
                  onClick={() => handleParaphrase(selectedIndex)} 
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                  <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Processing...' : 'Paraphrase'}
                </button>
              </div>
            </div>

            {/* Output Section */}
            {(outputText || isLoading || error) && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Result</h3>
                  {pdfUrl && (
                    <button
                      id="download-pdf-button"
                      onClick={handleDownloadPdf}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                      Download PDF
                    </button>
                  )}
                </div>
                <div className="mt-2 min-h-[200px] rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5 whitespace-pre-wrap">
                  {isLoading && <p className="text-gray-500">Generating your paraphrased text...</p>}
                  {error && <p className="text-red-600">Error: {error}</p>}
                  {outputText && <p>{outputText}</p>}
                </div>
              </div>
            )}
          </>
        )}
      </Tab.Group>
    </div>
  );
};

// Wrapper for Framer Motion AnimatePresence
const AnimatePresence = ({ children, ...props }) => {
  return <motion.div {...props}>{children}</motion.div>;
};

export default ParaphraserPage;