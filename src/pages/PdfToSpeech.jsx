/* eslint-disable no-unused-vars */
import { useReducer, useEffect, useCallback, useMemo, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { DocumentTextIcon, ArrowPathIcon, CheckIcon, ChevronUpDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { pdfToSpeech } from '../utils/api';
import DocumentUploader from '../components/DocumentUploader';
import AudioPlayer from '../components/AudioPlayer';
import ttsConfig from '../config/ttsConfig';
import { 
  pdfToSpeechReducer, 
  pdfToSpeechInitialState, 
  pdfToSpeechActions 
} from '../reducers/pdfToSpeechReducer';

const PdfToSpeech = () => {
  // Initialize state with reducer
  const [state, dispatch] = useReducer(pdfToSpeechReducer, {
    ...pdfToSpeechInitialState,
    language: ttsConfig.defaults.voice || 'en-us',
    format: '16khz_16bit_stereo',
    codec: ttsConfig.defaults.codec || 'MP3',
    speed: ttsConfig.defaults.speed || 0,
    useBase64: ttsConfig.defaults.base64 || false
  });

  const {
    file,
    language,
    voice,
    format,
    codec,
    speed,
    pitch,
    useBase64,
    audioUrl,
    isLoading,
    error,
    progress,
    isPlaying
  } = state;

  // Get available voices for the selected language
  const availableVoices = useMemo(() => {
    return ttsConfig.getVoices(language) || [];
  }, [language]);
  
  // Get available format codes from the config
  const formatOptions = useMemo(() => {
    const formats = ttsConfig.formats || [];
    return formats;
  }, []);

  // Set default voice when language changes
  useEffect(() => {
    if (availableVoices.length > 0) {
      const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
      dispatch(pdfToSpeechActions.setVoice(defaultVoice?.id || ''));
    } else {
      dispatch(pdfToSpeechActions.setVoice(''));
    }
  }, [availableVoices]);

  const handleFileChange = useCallback((selectedFile) => {
    dispatch(pdfToSpeechActions.setFile(selectedFile));
  }, []);

  const handlePlay = useCallback(async () => {
    if (!file) {
      dispatch(pdfToSpeechActions.setError('Please select a PDF file first'));
      return;
    }

    dispatch(pdfToSpeechActions.setIsLoading(true));
    dispatch(pdfToSpeechActions.clearError());
    dispatch(pdfToSpeechActions.setProgress(0));

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add TTS options to form data
      const formattedVoice = voice ? `${language}-${voice}` : language;
      formData.append('voice', formattedVoice);
      formData.append('format', format);
      formData.append('codec', codec);
      formData.append('speed', speed.toString());
      formData.append('pitch', pitch.toString());
      formData.append('base64', useBase64.toString());

      console.log('Starting PDF to speech conversion...');
      const audioBlob = await pdfToSpeech(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
        dispatch(pdfToSpeechActions.setProgress(percentCompleted));
      });
      
      if (!audioBlob) {
        throw new Error('No audio data received from server');
      }
      
      console.log('Received audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type,
        blob: audioBlob
      });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(audioBlob);
      console.log('Created object URL for audio blob:', url);
      
      // Set the audio URL directly - let the AudioPlayer handle validation and playback
      console.log('Setting audio URL for player:', url);
      dispatch(pdfToSpeechActions.setAudioUrl(url));
      dispatch(pdfToSpeechActions.setIsPlaying(false)); // Let AudioPlayer manage play state
      
      console.log('✅ PDF to speech conversion completed successfully');
      
    } catch (err) {
      console.error('Error converting PDF to speech:', err);
      
      // More specific error messages based on the error type
      let errorMessage = 'Failed to convert PDF to speech. ';
      
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else if (err.message.includes('404')) {
        errorMessage += 'Audio file not found on the server.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage += 'Authentication error. Please log in again.';
      } else if (err.message.includes('timed out')) {
        errorMessage += 'Request timed out. The server is taking too long to respond.';
      } else if (err.message.includes('unsupported format')) {
        errorMessage += 'The audio format is not supported by your browser. Try a different format.';
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      dispatch(pdfToSpeechActions.setError(errorMessage));
      
      // If we have a partial audio URL but playback failed, clean it up
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        dispatch(pdfToSpeechActions.clearAudio());
      }
    } finally {
      dispatch(pdfToSpeechActions.setIsLoading(false));
      dispatch(pdfToSpeechActions.setProgress(0));
    }
  }, [file, language, voice, format, codec, speed, pitch, useBase64, audioUrl]);
  
  const handleEnded = useCallback(() => {
    dispatch(pdfToSpeechActions.setIsPlaying(false));
  }, []);
  
  const handleError = useCallback((err) => {
    console.error('Audio playback error:', err);
    dispatch(pdfToSpeechActions.setError('Error playing audio. Please try again.'));
    dispatch(pdfToSpeechActions.setIsPlaying(false));
  }, []);

  useEffect(() => {
    // Clean up audio URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF to Speech</h1>
        <p className="text-lg text-gray-600">Upload a PDF and listen to it being read aloud</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF
          </label>
          <DocumentUploader 
            file={file} 
            onFileChange={handleFileChange}
            className="w-full"
            acceptedTypes={['.pdf']}
            acceptedMimeTypes={['application/pdf']}
            label="Upload PDF"
          />
        </div>

        {/* TTS Options Section */}
        <div className="mb-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Voice Options</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language Selector */}
              <Listbox value={language} onChange={(value) => dispatch(pdfToSpeechActions.setLanguage(value))}>
                {({ open }) => (
                  <div className="w-full">
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </Listbox.Label>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                        <span className="block truncate">
                          {ttsConfig.languages.find(lang => lang.code === language)?.name || 'Select language'}
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
                          {ttsConfig.languages.map((lang) => (
                            <Listbox.Option
                              key={lang.code}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={lang.code}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                    {lang.name}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                        active ? 'text-white' : 'text-indigo-600'
                                      }`}
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
              
              {/* Voice Selector */}
              <Listbox value={voice} onChange={(value) => dispatch(pdfToSpeechActions.setVoice(value))} disabled={availableVoices.length === 0}>
                {({ open }) => (
                  <div className="w-full">
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                      Voice
                    </Listbox.Label>
                    <div className="relative mt-1">
                      <Listbox.Button 
                        className={`relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm ${
                          availableVoices.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="block truncate">
                          {voice ? 
                            `${availableVoices.find(v => v.id === voice)?.name || voice} (${availableVoices.find(v => v.id === voice)?.gender || 'Unknown'})` : 
                            'Select a voice'
                          }
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
                          {availableVoices.length === 0 ? (
                            <div className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500">
                              No voices available
                            </div>
                          ) : (
                            availableVoices.map((v) => (
                              <Listbox.Option
                                key={v.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                  }`
                                }
                                value={v.id}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                      {v.name} ({v.gender})
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                          active ? 'text-white' : 'text-indigo-600'
                                        }`}
                                      >
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))
                          )}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </div>
                )}
              </Listbox>
              
              {/* Format Selector */}
              <Listbox value={format} onChange={(value) => dispatch(pdfToSpeechActions.setFormat(value))}>
                {({ open }) => (
                  <div className="w-full">
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                      Audio Format
                    </Listbox.Label>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                        <span className="block truncate">
                          {formatOptions.find(f => f.code === format)?.description || 'Select format'}
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
                          {formatOptions.map((fmt) => (
                            <Listbox.Option
                              key={fmt.code}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={fmt.code}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                    {fmt.description} ({fmt.code})
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                        active ? 'text-white' : 'text-indigo-600'
                                      }`}
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

              {/* Codec Selector */}
              <Listbox value={codec} onChange={(value) => dispatch(pdfToSpeechActions.setCodec(value))}>
                {({ open }) => (
                  <div className="w-full">
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                      Codec
                    </Listbox.Label>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                        <span className="block truncate">{codec || 'Select codec'}</span>
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
                          {ttsConfig.codecs.map((c) => (
                            <Listbox.Option
                              key={c}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={c}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                    {c}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                        active ? 'text-white' : 'text-indigo-600'
                                      }`}
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

              <div className="flex items-center">
                <input
                  id="base64"
                  type="checkbox"
                  checked={useBase64}
                  onChange={(e) => dispatch(pdfToSpeechActions.setUseBase64(e.target.checked))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="base64" className="ml-2 block text-sm text-gray-700">
                  Return as Base64
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="speed" className="block text-sm font-medium leading-6 text-gray-900">
                Speed: <span className="font-normal text-gray-500">{speed}</span>
              </label>
              <input 
                type="range" 
                id="speed" 
                min="-10" 
                max="10" 
                step="1" 
                value={speed} 
                onChange={e => dispatch(pdfToSpeechActions.setSpeed(parseInt(e.target.value)))} 
                className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
            </div>
            
            <div>
              <label htmlFor="pitch" className="block text-sm font-medium leading-6 text-gray-900">
                Pitch: <span className="font-normal text-gray-500">{pitch.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                id="pitch" 
                min="0.5" 
                max="1.5" 
                step="0.1" 
                value={pitch} 
                onChange={e => dispatch(pdfToSpeechActions.setPitch(parseFloat(e.target.value)))} 
                className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Processing PDF...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handlePlay}
            disabled={isLoading || !file}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isLoading || !file ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Processing...
              </>
            ) : (
              'Convert to Speech'
            )}
          </button>
        </div>
      </div>

      {/* Audio Player Section - This should show when audioUrl is available */}
      {audioUrl && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Listen to your PDF</h2>
          <AudioPlayer 
            audioUrl={audioUrl}
            onEnded={handleEnded}
            onError={handleError}
            autoPlay={false}
          />
          
          {/* Additional Download Button */}
          <div className="mt-4 flex justify-center">
            <a
              href={audioUrl}
              download="pdf-speech.mp3"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download Audio
            </a>
          </div>
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
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToSpeech;