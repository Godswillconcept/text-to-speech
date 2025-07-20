import { useReducer, useCallback, useEffect, useMemo, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ArrowPathIcon, SpeakerWaveIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { textToSpeech } from '../utils/api';
import { useApi } from '../hooks/useApi.js';
import { textToSpeechReducer, textToSpeechInitialState, textToSpeechActions } from '../reducers/textToSpeechReducer.js';
import AudioPlayer from '../components/AudioPlayer';
import TextInput from '../components/TextInput';
import ttsConfig from '../config/ttsConfig';

const TextToSpeech = () => {
  // Initialize state with config defaults
  const initialStateWithDefaults = {
    ...textToSpeechInitialState,
    language: ttsConfig.languages[0]?.code || 'en-us',
    format: ttsConfig.formats[0]?.code || ttsConfig.defaults.format,
    codec: ttsConfig.defaults.codec,
    rate: ttsConfig.defaults.speed,
    useBase64: ttsConfig.defaults.base64
  };
  
  const [state, dispatch] = useReducer(textToSpeechReducer, initialStateWithDefaults);
  const { text, language, voice, format, codec, rate, pitch, useBase64, audioUrl } = state;
  
  const { data: audioUrlFromApi, isLoading, error, request: generateSpeech } = useApi(textToSpeech);
  
  // Get available voices for the selected language
  const availableVoices = useMemo(() => {
    return ttsConfig.getVoices(language) || [];
  }, [language]);
  
  // Get available format codes from the config
  const formatOptions = useMemo(() => {
    const formats = ttsConfig.formats || [];
    console.log('Available formats:', formats.map(f => f.code));
    return formats;
  }, []);
  
  // Set default format on initial load
  useEffect(() => {
    if (formatOptions.length > 0 && !format) {
      // Default to 16kHz 16-bit stereo if available
      const defaultFormat = formatOptions.find(f => f.code === '16khz_16bit_stereo') || formatOptions[0];
      if (defaultFormat) {
        console.log('Setting default format:', defaultFormat.code);
        dispatch(textToSpeechActions.setFormat(defaultFormat.code));
      }
    }
  }, [formatOptions, format]);
  
  // Set default voice when language changes
  useEffect(() => {
    if (availableVoices.length > 0) {
      const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
      dispatch(textToSpeechActions.setVoice(defaultVoice?.id || ''));
    } else {
      dispatch(textToSpeechActions.setVoice(''));
    }
  }, [availableVoices]);

  // Update audio URL when we get a new one from the API
  useEffect(() => {
    if (audioUrlFromApi) {
      // If it's already a blob URL or data URL, use it directly
      if (audioUrlFromApi.startsWith('blob:') || audioUrlFromApi.startsWith('data:')) {
        console.log('Using blob/data URL directly:', audioUrlFromApi);
        dispatch(textToSpeechActions.setAudioUrl(audioUrlFromApi));
      } else {
        // Otherwise, construct the full URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const fullUrl = audioUrlFromApi.startsWith('http') 
          ? audioUrlFromApi 
          : `${baseUrl}${audioUrlFromApi.startsWith('/') ? '' : '/'}${audioUrlFromApi}`;
        
        console.log('Constructed audio URL:', fullUrl);
        dispatch(textToSpeechActions.setAudioUrl(fullUrl));
      }
    }
  }, [audioUrlFromApi]);

  const handleGenerateClick = useCallback(() => {
    if (!text.trim() || !voice) {
      console.error('Missing required fields - text:', text, 'voice:', voice);
      return;
    }
    
    // Ensure format is a string code
    let formatCode = format;
    if (typeof format === 'object' && format !== null) {
      formatCode = format.code || format;
    }
    
    // Log the current state for debugging
    console.log('Current state:', {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      voice,
      language,
      rate,
      pitch,
      format,
      formatCode,
      codec,
      useBase64
    });
    
    // Validate the format code against available formats
    const availableFormatCodes = ttsConfig.formats.map(f => f.code);
    
    if (!availableFormatCodes.includes(formatCode)) {
      console.error('Invalid format selected. Must be one of:', availableFormatCodes);
      return;
    }
    
    // Format the voice parameter as 'language-voice' (e.g., 'en-us-linda')
    const formattedVoice = `${language}-${voice}`;
    
    // Log the request payload for debugging
    const requestData = {
      text,
      voice: formattedVoice,  // Combined language and voice (e.g., 'en-us-linda')
      rate,
      pitch,
      format: formatCode,
      codec,
      base64: useBase64
    };
    
    // Ensure we have both voice and language set
    if (!voice) {
      console.error('No voice selected');
      return;
    }
    if (!language) {
      console.error('No language selected');
      return;
    }
    
    console.log('Formatted voice parameter:', formattedVoice);
    
    console.log('Sending TTS request with data:', requestData);
    
    // Make the API call
    generateSpeech(requestData);
  }, [text, voice, language, rate, pitch, format, codec, useBase64, generateSpeech]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  // Helper function to get the display name for the selected format
  const getFormatDisplayName = (formatCode) => {
    const fmt = formatOptions.find(f => f.code === formatCode);
    return fmt ? `${fmt.description} (${fmt.code})` : 'Select format';
  };

  // Helper function to get the display name for the selected voice
  const getVoiceDisplayName = (voiceId) => {
    if (!voiceId) return 'Select a voice';
    const v = availableVoices.find(v => v.id === voiceId);
    return v ? `${v.name} (${v.gender})` : 'Select a voice';
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Text to Speech</h1>
        <p className="text-lg text-gray-600">Convert your text into natural-sounding speech</p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 sm:p-8 ring-1 ring-gray-200">
        <div className="mb-6">
          <label htmlFor="tts-text-input" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
            Enter your text
          </label>
          <TextInput
            id="tts-text-input"
            multiline
            rows={8}
            placeholder="Type or paste your text here..."
            value={text}
            onChange={(text) => dispatch(textToSpeechActions.setText(text))}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selector */}
            <Listbox value={language} onChange={(language) => dispatch(textToSpeechActions.setLanguage(language))}>
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
                              classNames(
                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                'relative cursor-default select-none py-2 pl-3 pr-9'
                              )
                            }
                            value={lang.code}
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                  {lang.name}
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
            
            {/* Voice Selector */}
            <Listbox value={voice} onChange={(voice) => dispatch(textToSpeechActions.setVoice(voice))} disabled={availableVoices.length === 0}>
              {({ open }) => (
                <div className="w-full">
                  <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                    Voice
                  </Listbox.Label>
                  <div className="relative mt-1">
                    <Listbox.Button 
                      className={classNames(
                        'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm',
                        availableVoices.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      )}
                    >
                      <span className="block truncate">
                        {getVoiceDisplayName(voice)}
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
                                classNames(
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                  'relative cursor-default select-none py-2 pl-3 pr-9'
                                )
                              }
                              value={v.id}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                    {v.name} ({v.gender})
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
                          ))
                        )}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </div>
              )}
            </Listbox>
            
            {/* Format Selector */}
            <Listbox 
              value={format} 
              onChange={(value) => {
                console.log('Selected format changed:', value);
                dispatch(textToSpeechActions.setFormat(value));
              }}
            >
              {({ open }) => (
                <div className="w-full">
                  <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                    Audio Format
                  </Listbox.Label>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                      <span className="block truncate">
                        {getFormatDisplayName(format)}
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
                              classNames(
                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                'relative cursor-default select-none py-2 pl-3 pr-9'
                              )
                            }
                            value={fmt.code}
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                  {fmt.description} ({fmt.code})
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

            {/* Codec Selector */}
            <Listbox value={codec} onChange={(codec) => dispatch(textToSpeechActions.setCodec(codec))}>
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
                              classNames(
                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                'relative cursor-default select-none py-2 pl-3 pr-9'
                              )
                            }
                            value={c}
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                  {c}
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

            <div className="flex items-center">
              <input
                id="base64"
                type="checkbox"
                checked={useBase64}
                onChange={(e) => dispatch(textToSpeechActions.setUseBase64(e.target.checked))}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="base64" className="ml-2 block text-sm text-gray-700">
                Return as Base64
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="rate" className="block text-sm font-medium leading-6 text-gray-900">
              Speed: <span className="font-normal text-gray-500">{rate.toFixed(1)}x</span>
            </label>
            <input 
              type="range" 
              id="rate" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={rate} 
              onChange={e => dispatch(textToSpeechActions.setRate(parseFloat(e.target.value)))} 
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
              onChange={e => dispatch(textToSpeechActions.setPitch(parseFloat(e.target.value)))} 
              className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGenerateClick}
            disabled={isLoading || !text.trim()}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? ( <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5" /> ) : ( <SpeakerWaveIcon className="-ml-1 mr-3 h-5 w-5" /> )}
            {isLoading ? 'Processing...' : 'Convert to Speech'}
          </button>
        </div>
      </div>

      {audioUrl && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Audio</h2>
          <AudioPlayer 
            audioUrl={audioUrl}
            onEnded={() => console.log('Playback finished')}
            onError={(error) => console.error('Audio playback error:', error)}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;