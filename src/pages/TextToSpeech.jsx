import { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { textToSpeech } from '../utils/api';
import { useApi } from '../hooks/useApi.js';
import AudioPlayer from '../components/AudioPlayer';
import TextInput from '../components/TextInput';

const TextToSpeech = () => {
  // ... All your hooks and state logic remains unchanged ...
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('en-US-1');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState('');
  const { data: audioBlob, isLoading, error, request: generateSpeech } = useApi(textToSpeech);
  // ... voices array, useEffect, handleGenerateClick ...
  
  const voices = [
    { id: 'en-US-1', name: 'English (US) - Female', lang: 'en-US' },
    { id: 'en-US-2', name: 'English (US) - Male', lang: 'en-US' },
    { id: 'en-GB-1', name: 'English (UK) - Female', lang: 'en-GB' },
  ];

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBlob]);

  const handleGenerateClick = useCallback(() => {
    if (!text.trim()) return;
    generateSpeech({ text, voice, rate, pitch, });
  }, [text, voice, rate, pitch, generateSpeech]);


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
            onChange={setText}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* ... Voice, Speed, Pitch controls ... */}
          {/* No changes needed inside here */}
          <div>
            <label htmlFor="voice" className="block text-sm font-medium leading-6 text-gray-900 mb-1">Voice</label>
            <select
              id="voice"
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
            >
              {voices.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="rate" className="block text-sm font-medium leading-6 text-gray-900">Speed: <span className="font-normal text-gray-500">{rate.toFixed(1)}x</span></label>
            <input type="range" id="rate" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>
          <div>
            <label htmlFor="pitch" className="block text-sm font-medium leading-6 text-gray-900">Pitch: <span className="font-normal text-gray-500">{pitch.toFixed(1)}</span></label>
            <input type="range" id="pitch" min="0.5" max="1.5" step="0.1" value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
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
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Listen to your speech</h2>
          <AudioPlayer
            audioUrl={audioUrl}
            autoPlay={true}
            className="w-full"
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