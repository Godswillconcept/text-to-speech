// PDF-to-Speech Reducer
export const pdfToSpeechInitialState = {
  file: null,
  language: 'en-us', // Will be set from config
  voice: '',
  format: '16khz_16bit_stereo', // Default format
  codec: 'MP3', // Default codec
  speed: 0, // Speed range from -10 to 10
  pitch: 1.0,
  useBase64: false,
  audioUrl: '',
  isLoading: false,
  error: '',
  progress: 0,
  isPlaying: false
};

// Action types
export const PDF_TO_SPEECH_ACTIONS = {
  SET_FILE: 'SET_FILE',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_VOICE: 'SET_VOICE',
  SET_FORMAT: 'SET_FORMAT',
  SET_CODEC: 'SET_CODEC',
  SET_SPEED: 'SET_SPEED',
  SET_PITCH: 'SET_PITCH',
  SET_USE_BASE64: 'SET_USE_BASE64',
  SET_AUDIO_URL: 'SET_AUDIO_URL',
  SET_IS_LOADING: 'SET_IS_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PROGRESS: 'SET_PROGRESS',
  SET_IS_PLAYING: 'SET_IS_PLAYING',
  CLEAR_AUDIO: 'CLEAR_AUDIO',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_SETTINGS: 'RESET_SETTINGS',
  RESET_ALL: 'RESET_ALL'
};

// Action creators
export const pdfToSpeechActions = {
  setFile: (file) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_FILE,
    payload: file
  }),
  
  setLanguage: (language) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_LANGUAGE,
    payload: language
  }),
  
  setVoice: (voice) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_VOICE,
    payload: voice
  }),
  
  setFormat: (format) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_FORMAT,
    payload: format
  }),
  
  setCodec: (codec) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_CODEC,
    payload: codec
  }),
  
  setSpeed: (speed) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_SPEED,
    payload: speed
  }),
  
  setPitch: (pitch) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_PITCH,
    payload: pitch
  }),
  
  setUseBase64: (useBase64) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_USE_BASE64,
    payload: useBase64
  }),
  
  setAudioUrl: (audioUrl) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_AUDIO_URL,
    payload: audioUrl
  }),
  
  setIsLoading: (isLoading) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_IS_LOADING,
    payload: isLoading
  }),
  
  setError: (error) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_ERROR,
    payload: error
  }),
  
  setProgress: (progress) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_PROGRESS,
    payload: progress
  }),
  
  setIsPlaying: (isPlaying) => ({
    type: PDF_TO_SPEECH_ACTIONS.SET_IS_PLAYING,
    payload: isPlaying
  }),
  
  clearAudio: () => ({
    type: PDF_TO_SPEECH_ACTIONS.CLEAR_AUDIO
  }),
  
  clearError: () => ({
    type: PDF_TO_SPEECH_ACTIONS.CLEAR_ERROR
  }),
  
  resetSettings: () => ({
    type: PDF_TO_SPEECH_ACTIONS.RESET_SETTINGS
  }),
  
  resetAll: () => ({
    type: PDF_TO_SPEECH_ACTIONS.RESET_ALL
  })
};

// Reducer function
export const pdfToSpeechReducer = (state, action) => {
  switch (action.type) {
    case PDF_TO_SPEECH_ACTIONS.SET_FILE:
      return {
        ...state,
        file: action.payload,
        // Clear error when new file is selected
        error: ''
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
        // Reset voice when language changes
        voice: ''
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_VOICE:
      return {
        ...state,
        voice: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_FORMAT:
      return {
        ...state,
        format: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_CODEC:
      return {
        ...state,
        codec: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_SPEED:
      return {
        ...state,
        speed: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_PITCH:
      return {
        ...state,
        pitch: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_USE_BASE64:
      return {
        ...state,
        useBase64: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_AUDIO_URL:
      return {
        ...state,
        audioUrl: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.SET_IS_PLAYING:
      return {
        ...state,
        isPlaying: action.payload
      };
      
    case PDF_TO_SPEECH_ACTIONS.CLEAR_AUDIO:
      return {
        ...state,
        audioUrl: '',
        isPlaying: false,
        progress: 0
      };
      
    case PDF_TO_SPEECH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: ''
      };
      
    case PDF_TO_SPEECH_ACTIONS.RESET_SETTINGS:
      return {
        ...pdfToSpeechInitialState,
        // Keep the current file but reset everything else
        file: state.file
      };
      
    case PDF_TO_SPEECH_ACTIONS.RESET_ALL:
      return {
        ...pdfToSpeechInitialState
      };
      
    default:
      return state;
  }
};