import React, { useState, useRef } from 'react';
import { ArrowPathIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

const Paraphraser = ({ onParaphrase, isLoading = false, error = '' }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [tone, setTone] = useState('standard');
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  const tones = [
    { id: 'standard', name: 'Standard' },
    { id: 'formal', name: 'Formal' },
    { id: 'casual', name: 'Casual' },
    { id: 'friendly', name: 'Friendly' },
    { id: 'professional', name: 'Professional' },
  ];

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;
    
    try {
      const result = await onParaphrase({
        text: inputText,
        tone,
      });
      
      if (result && result.paraphrasedText) {
        setOutputText(result.paraphrasedText);
      }
    } catch (err) {
      console.error('Error in paraphrasing:', err);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    
    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-1">
              Original Text
            </label>
            <div className="mt-1">
              <textarea
                id="input-text"
                rows={12}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                placeholder="Type or paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!inputText}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                !inputText
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="output-text" className="block text-sm font-medium text-gray-700">
                Paraphrased Text
              </label>
              {outputText && (
                <button
                  type="button"
                  onClick={() => handleCopy(outputText)}
                  className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                    copied
                      ? 'text-green-700 bg-green-100'
                      : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-3.5 w-3.5 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="mt-1">
              <div
                id="output-text"
                className={`min-h-[200px] p-3 border ${
                  outputText ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                } rounded-md`}
              >
                {outputText ? (
                  <p className="whitespace-pre-wrap">{outputText}</p>
                ) : (
                  <p className="text-gray-400 italic">
                    Your paraphrased text will appear here...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
        <div className="w-full sm:w-auto">
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
            Tone
          </label>
          <select
            id="tone"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={isLoading}
          >
            {tones.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="button"
          onClick={handleParaphrase}
          disabled={isLoading || !inputText.trim()}
          className={`inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
            isLoading || !inputText.trim()
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto`}
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Paraphrasing...
            </>
          ) : (
            'Paraphrase Text'
          )}
        </button>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mt-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Tips for better paraphrasing</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Keep your original meaning but use different words and sentence structures</li>
                <li>Longer texts generally produce better results</li>
                <li>Try different tones to see how they affect the output</li>
                <li>For technical content, ensure the paraphrased text maintains accuracy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paraphraser;