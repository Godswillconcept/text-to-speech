import { useState, Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon, LanguageIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

import { useApi } from '../hooks/useApi.js';
import { paraphraseText, paraphrasePdf } from '../utils/api.js';
import TextInput from '../components/TextInput';
import PdfUploader from '../components/PdfUploader';

// A helper for dynamic class names with Headless UI
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ParaphraserPage = () => {
  // State for the inputs
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [tone, setTone] = useState('standard');
  const [outputText, setOutputText] = useState('');
  
  // Two instances of useApi for our two different endpoints
  const { isLoading: isTextLoading, error: textError, request: paraphraseFromText, clearError: clearTextError } = useApi(paraphraseText);
  const { isLoading: isFileLoading, error: fileError, request: paraphraseFromFile, clearError: clearFileError } = useApi(paraphrasePdf);

  const isLoading = isTextLoading || isFileLoading;
  const error = textError || fileError;

  const handleParaphrase = async (tabIndex) => {
    setOutputText(''); // Clear previous results
    let result;

    if (tabIndex === 0) { // Paraphrase from Text
      if (!inputText.trim()) return;
      result = await paraphraseFromText({ text: inputText, tone });
    } else { // Paraphrase from PDF
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tone', tone); // Sending tone along with the file
      result = await paraphraseFromFile(formData);
    }
    
    if (result && result.paraphrasedText) {
      setOutputText(result.paraphrasedText);
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
    { id: 'formal', name: 'Formal' },
    { id: 'casual', name: 'Casual' },
    { id: 'friendly', name: 'Friendly' },
    { id: 'professional', name: 'Professional' },
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
                    <PdfUploader file={file} onFileChange={handleFileChange} />
                  </Tab.Panel>
                </motion.div>
              </AnimatePresence>
            </Tab.Panels>

            {/* Shared Controls and Output */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700">Tone</label>
                <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                  {tones.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
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