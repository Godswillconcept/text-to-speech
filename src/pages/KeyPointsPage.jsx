import { useState, Fragment } from 'react';
import { Tab } from '@headlessui/react';
// Animation imports removed as they're not currently used
import { DocumentArrowUpIcon, LanguageIcon, LightBulbIcon } from '@heroicons/react/24/outline';

import { useApi } from '../hooks/useApi.js';
import { getKeyPointsFromText, getKeyPointsFromPdf } from '../utils/api.js';
import TextInput from '../components/TextInput';
import DocumentUploader from '../components/DocumentUploader';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const KeyPointsPage = () => {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [keyPoints, setKeyPoints] = useState([]);

  const { isLoading: isTextLoading, error: textError, request: extractFromText } = useApi(getKeyPointsFromText);
  const { isLoading: isFileLoading, error: fileError, request: extractFromFile, clearError: clearFileError } = useApi(getKeyPointsFromPdf);

  const isLoading = isTextLoading || isFileLoading;
  const error = textError || fileError;

  const handleExtract = async (tabIndex) => {
    setKeyPoints([]);
    let result;
    if (tabIndex === 0) {
      if (!inputText.trim()) return;
      result = await extractFromText({ text: inputText });
    } else {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      result = await extractFromFile(formData);
    }
    if (result && result.keyPoints) {
      setKeyPoints(result.keyPoints);
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

            <Tab.Panels className="mt-6">
              <Tab.Panel>
                <TextInput
                  value={inputText}
                  onChange={setInputText}
                  placeholder="Paste your text here..."
                  multiline
                  rows={8}
                />
              </Tab.Panel>
              <Tab.Panel>
                <DocumentUploader
                  onFileSelect={setFile}
                  selectedFile={file}
                  onClear={() => {
                    setFile(null);
                    clearFileError();
                  }}
                />
              </Tab.Panel>
            </Tab.Panels>

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => handleExtract(selectedIndex)} disabled={isLoading} className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:bg-green-300">
                <LightBulbIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isLoading && 'animate-spin'}`} />
                {isLoading ? 'Extracting...' : 'Extract Key Points'}
              </button>
            </div>

            {(keyPoints.length > 0 || isLoading || error) && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Extracted Key Points</h3>
                <div className="mt-2 min-h-[200px] rounded-xl bg-white p-6 shadow-lg ring-1 ring-black ring-opacity-5">
                  {isLoading && <p className="text-gray-500">Finding the key points...</p>}
                  {error && <p className="text-red-600">Error: {error}</p>}
                  {keyPoints.length > 0 && (
                    <ul className="list-disc space-y-3 pl-5">
                      {keyPoints.map((point, index) => <li key={index} className="text-gray-800">{point}</li>)}
                    </ul>
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