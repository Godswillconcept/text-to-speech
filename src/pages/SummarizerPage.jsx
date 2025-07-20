/* eslint-disable no-unused-vars */
import { useReducer, Fragment, useCallback } from 'react';
import { Tab, Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentArrowUpIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi.js';
import { summarizeText, summarizePdf } from '../utils/api.js';
import { summarizerReducer, summarizerInitialState, summarizerActions } from '../reducers/summarizerReducer.js';
import TextInput from '../components/TextInput';
import DocumentUploader from '../components/DocumentUploader.jsx';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SummarizerPage = () => {
  const [state, dispatch] = useReducer(summarizerReducer, summarizerInitialState);
  const { inputText, file, summaryLength, summaryType, summaryText } = state;

  // API hooks for both text and file summarization
  const { isLoading: isTextLoading, error: textError, request: summarizeFromText, clearError: clearTextError } = useApi(summarizeText);
  const { isLoading: isFileLoading, error: fileError, request: summarizeFromFile, clearError: clearFileError } = useApi(summarizePdf);

  const isLoading = isTextLoading || isFileLoading;
  const error = textError || fileError;

  const handleSummarize = async (tabIndex) => {
    dispatch(summarizerActions.clearSummary()); // Clear previous results
    let result;

    // Get the mapped length value (1-6)
    const mappedLength = getMappedLength(summaryLength);

    // Use the selected format directly (it should be one of: 'paragraph', 'bullet', 'concise')
    const format = typeOptions.some(opt => opt.id === summaryType) ? summaryType : 'paragraph';

    const options = {
      length: mappedLength,
      format: format
    };

    if (tabIndex === 0) { // Summarize from Text
      if (!inputText.trim()) return;
      result = await summarizeFromText({
        text: inputText,
        ...options
      });
    } else { // Summarize from PDF
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('length', options.length.toString());
      formData.append('format', options.format);
      result = await summarizeFromFile(formData);
    }

    if (result && result.summary) {
      dispatch(summarizerActions.setSummaryText(result.summary));
    }
  };

  const handleTextChange = useCallback((text) => {
    dispatch(summarizerActions.setInputText(text));
    if (textError) clearTextError();
  }, [textError, clearTextError]);

  const handleFileChange = useCallback((newFile) => {
    dispatch(summarizerActions.setFile(newFile));
    if (fileError) clearFileError();
  }, [fileError, clearFileError]);

  const lengthOptions = [
    { id: '1', name: 'One Sentence' },
    { id: '2', name: 'Short Paragraph' },
    { id: '3', name: 'Medium Summary' },
    { id: '4', name: 'Detailed Summary' },
    { id: '5', name: 'Very Detailed' },
    { id: '6', name: 'Key Paragraphs' },
  ];

  // Map frontend length values to backend expected values (1-6)
  const getMappedLength = (length) => {
    // Ensure the length is within the valid range (1-6)
    return Math.min(6, Math.max(1, parseInt(length) || 3));
  };

  const typeOptions = [
    { id: 'paragraph', name: 'Paragraph' },
    { id: 'bullet', name: 'Bullet Points' },
    { id: 'concise', name: 'Concise' },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">AI Text Summarizer</h1>
        <p className="mt-4 text-lg text-gray-600">Get the key points from any text or document, fast.</p>
      </div>

      <Tab.Group>
        {({ selectedIndex }) => (
          <>
            <Tab.List className="flex space-x-1 rounded-xl bg-purple-900/20 p-1 max-w-md mx-auto">
              <Tab as="div" className="w-full">
                {({ selected }) => (
                  <button className={classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'ring-white/60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-purple-700 shadow' : 'text-gray-700 hover:bg-white/[0.5]')}>
                    <ChatBubbleBottomCenterTextIcon className="inline h-5 w-5 mr-2" />
                    From Text
                  </button>
                )}
              </Tab>
              <Tab as="div" className="w-full">
                {({ selected }) => (
                  <button className={classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'ring-white/60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-purple-700 shadow' : 'text-gray-700 hover:bg-white/[0.5]')}>
                    <DocumentArrowUpIcon className="inline h-5 w-5 mr-2" />
                    From Document
                  </button>
                )}
              </Tab>
            </Tab.List>

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
                    <TextInput multiline rows={10} placeholder="Paste your article or text here to summarize..." value={inputText} onChange={handleTextChange} />
                  </Tab.Panel>

                  <Tab.Panel className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5">
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

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <Listbox value={summaryType} onChange={(type) => dispatch(summarizerActions.setSummaryType(type))}>
                  {({ open }) => (
                    <>
                      <Listbox.Label className="block text-sm font-medium text-gray-700">Format</Listbox.Label>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm">
                          <span className="block truncate">{typeOptions.find(t => t.id === summaryType)?.name}</span>
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
                            {typeOptions.map((option) => (
                              <Listbox.Option
                                key={option.id}
                                className={({ active }) =>
                                  classNames(
                                    active ? 'bg-purple-600 text-white' : 'text-gray-900',
                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                  )
                                }
                                value={option.id}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                      {option.name}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={classNames(
                                          active ? 'text-white' : 'text-purple-600',
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
                    </>
                  )}
                </Listbox>
              </div>
              <div className="md:col-span-1">
                <Listbox value={summaryLength} onChange={(length) => dispatch(summarizerActions.setSummaryLength(length))}>
                  {({ open }) => (
                    <>
                      <Listbox.Label className="block text-sm font-medium text-gray-700">Length</Listbox.Label>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm">
                          <span className="block truncate">{lengthOptions.find(l => l.id === summaryLength)?.name}</span>
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
                            {lengthOptions.map((option) => (
                              <Listbox.Option
                                key={option.id}
                                className={({ active }) =>
                                  classNames(
                                    active ? 'bg-purple-600 text-white' : 'text-gray-900',
                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                  )
                                }
                                value={option.id}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                      {option.name}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={classNames(
                                          active ? 'text-white' : 'text-purple-600',
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
                    </>
                  )}
                </Listbox>
              </div>
              <div className="md:col-span-1 self-end flex justify-end">
                <button type="button" onClick={() => handleSummarize(selectedIndex)} disabled={isLoading} className="inline-flex w-full md:w-auto items-center justify-center rounded-md bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed">
                  <DocumentMagnifyingGlassIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isLoading && 'animate-spin'}`} />
                  {isLoading ? 'Summarizing...' : 'Summarize'}
                </button>
              </div>
            </div>

            {(summaryText || isLoading || error) && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Summary Result</h3>
                  {summaryText && !isLoading && !error && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Summary generated
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="mt-2 min-h-[200px] rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5 prose max-w-none">
                    {isLoading && (
                      <div className="flex items-center justify-center h-40">
                        <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
                        <span className="ml-2 text-gray-600">Generating your summary...</span>
                      </div>
                    )}
                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {summaryText && (
                      summaryType === 'bullet'
                        ? (
                          <ul className="list-disc pl-5 space-y-2">
                            {summaryText.split('\n').filter(line => line.trim() !== '').map((line, index) => (
                              <li key={index} className="text-gray-700">
                                {line.replace(/^[-•*]\s*/, '')}
                              </li>
                            ))}
                          </ul>
                        )
                        : (
                          <p className={`whitespace-pre-wrap text-gray-700 ${summaryType === 'concise' ? 'font-medium' : ''}`}>
                            {summaryText}
                          </p>
                        )
                    )}
                  </div>
                  {summaryText && !isLoading && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(summaryText);
                        // Optional: Add toast notification
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
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

export default SummarizerPage;