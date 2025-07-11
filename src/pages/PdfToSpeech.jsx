import { useState, useEffect, useCallback } from 'react';
import { DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { pdfToSpeech } from '../utils/api';
import DocumentUploader from '../components/DocumentUploader';
import AudioPlayer from '../components/AudioPlayer';

const PdfToSpeech = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileChange = useCallback((selectedFile) => {
    setFile(selectedFile);
    setError('');
  }, []);

  const handlePlay = useCallback(async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setIsLoading(true);
    setError('');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const audioBlob = await pdfToSpeech(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setIsPlaying(true);
    } catch (err) {
      console.error('Error converting PDF to speech:', err);
      setError('Failed to convert PDF to speech. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [file]);
  
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  const handleError = useCallback((err) => {
    console.error('Audio playback error:', err);
    setError('Error playing audio. Please try again.');
    setIsPlaying(false);
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

      {audioUrl && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Listen to your PDF</h2>
          <AudioPlayer 
            audioUrl={audioUrl}
            isPlaying={isPlaying}
            onPlayPause={setIsPlaying}
            onEnded={handleEnded}
            onError={handleError}
          />
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