/* eslint-disable no-unused-vars */
import { useState, Fragment, useCallback } from 'react';
import { Tab, Listbox, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon, LanguageIcon, ArrowPathIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

import { useApi } from '../hooks/useApi.js';
import { paraphraseText, paraphrasePdf } from '../utils/api.js';
import TextInput from '../components/TextInput';
import DocumentUploader from '../components/DocumentUploader';

// A helper for dynamic class names with Headless UI
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ParaphraserPage = () => {
  // State for the inputs
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [outputText, setOutputText] = useState('');
  const [tone, setTone] = useState('neutral'); // Default to neutral to match backend
  
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

  const handleParaphrase = async (tabIndex) => {
    setOutputText(''); // Clear previous results
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
          tone: tone.toLowerCase()
        });
        
        // Handle the response format from the backend
        if (result && result.text) {
          setOutputText(result.text);
        } else if (result && result.paraphrasedText) {
          setOutputText(result.paraphrasedText);
        } else if (result && result.result) {
          setOutputText(result.result);
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
        formData.append('complexity', 'maintain');
        
        result = await paraphraseFromFile(formData);
        
        // Handle the response format from the backend
        if (result && result.text) {
          setOutputText(result.text);
        } else if (result && result.paraphrasedText) {
          setOutputText(result.paraphrasedText);
        } else if (result && result.result) {
          setOutputText(result.result);
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
      setInputText(text);
      if(textError) clearTextError();
  }

  const handleFileChange = (newFile) => {
      setFile(newFile);
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
  
  // Tone options for the select dropdown

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
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <Listbox value={tone} onChange={setTone} disabled={isLoading}>
                  {({ open }) => (
                    <div className="w-full">
                      <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                        Tone
                      </Listbox.Label>
                      <div className="relative mt-1">
                        <Listbox.Button 
                          className={classNames(
                            'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm',
                            isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:border-indigo-300',
                            'transition-all duration-200 ease-in-out'
                          )}
                          aria-describedby="tone-description"
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
                                  classNames(
                                    active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                  )
                                }
                                value={toneOption.id}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                      {toneOption.name}
                                    </span>
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
                    </div>
                  )}
                </Listbox>
                <p className="mt-1 text-xs text-gray-500" id="tone-description">
                  Select the tone for paraphrasing
                </p>
              </div>
              <div className="md:col-span-2 self-end flex justify-end">
                <button type="button" onClick={() => handleParaphrase(selectedIndex)} disabled={isLoading} className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                  <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isLoading && 'animate-spin'}`} />
                  {isLoading ? 'Paraphrasing...' : 'Paraphrase'}
                </button>
              </div>
            </div>

            {/* Output Section */}
            {(outputText || isLoading || error) && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Result</h3>
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