import { useState, Fragment } from 'react';
import { Tab, Listbox } from '@headlessui/react';
import { DocumentArrowUpIcon, LanguageIcon, SparklesIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

import { useApi } from '../hooks/useApi.js';
import { changeToneOfText, changeToneOfPdf } from '../utils/api.js';
import TextInput from '../components/TextInput';
import PdfUploader from '../components/PdfUploader';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ChangeTonePage = () => {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [tone, setTone] = useState('professional');
  const [tonedText, setTonedText] = useState('');

  const { isLoading: isTextLoading, error: textError, request: changeToneFromText } = useApi(changeToneOfText);
  const { 
    isLoading: isFileLoading, 
    error: fileError, 
    request: changeToneFromFile,
    clearError: clearFileError 
  } = useApi(changeToneOfPdf);

  const isLoading = isTextLoading || isFileLoading;
  const error = textError || fileError;

  const handleChangeTone = async (tabIndex) => {
    setTonedText('');
    let result;
    if (tabIndex === 0) {
      if (!inputText.trim()) return;
      result = await changeToneFromText({ text: inputText, tone });
    } else {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tone', tone);
      result = await changeToneFromFile(formData);
    }
    if (result && result.tonedText) {
      setTonedText(result.tonedText);
    }
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
                <PdfUploader
                  onFileSelect={setFile}
                  selectedFile={file}
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
                  {isLoading && <p className="text-gray-500">Adjusting the tone of your text...</p>}
                  {error && <p className="text-red-600">Error: {error}</p>}
                  {tonedText && <p>{tonedText}</p>}
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