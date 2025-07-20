// Text-to-Speech Reducer
export const textToSpeechInitialState = {
  text: '',
  language: 'en-us', // Will be set from config
  voice: '',
  format: '', // Will be set from config
  codec: 'opus', // Default codec
  rate: 1.0,
  pitch: 1.0,
  useBase64: false,
  audioUrl: ''
};

// Action types
export const TEXT_TO_SPEECH_ACTIONS = {
  SET_TEXT: 'SET_TEXT',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_VOICE: 'SET_VOICE',
  SET_FORMAT: 'SET_FORMAT',
  SET_CODEC: 'SET_CODEC',
  SET_RATE: 'SET_RATE',
  SET_PITCH: 'SET_PITCH',
  SET_USE_BASE64: 'SET_USE_BASE64',
  SET_AUDIO_URL: 'SET_AUDIO_URL',
  CLEAR_AUDIO: 'CLEAR_AUDIO',
  RESET_SETTINGS: 'RESET_SETTINGS'
};

// Action creators
export const textToSpeechActions = {
  setText: (text) => ({
    type: TEXT_TO_SPEECH_ACTIONS.SET_TEXT,
    payload: text
  }),
  
  setLanguage: (language) => ({
    type: TEXT_TO_SPEECH_ACTIONS.SET_LANGUAGE,
    payload: language
  }),
  
  setVoice: (voice) => ({
    type: TEXT_TO_SPEECH_ACTIONS.SET_VOICE,
    payload: voice
  }),
  
  setFormat: (format) => ({
    type: TEXT_TO_SPEECH_ACTIONS.SET_FORMAT,
    payload: format
  }),
  
  setCodec: (codec) => ({
    type: TEXT_TO_SPEECH_ACTIONS.SET_CODEC,
    payload: codec
  }),
  
  setRate: (rate) => ({
    type: TEXT_TO_SPEECH_ACTIONS.SET_RATE,
    payload: rate
  }),
  
  setPitch: (pitch) => ({
    type: TEXT_TO_SPEECH_ACTIONS.SET_PITCH,
    payload: pitch
  }),
  
  setUseBase64: (useBase64) => ({
    type: TEXT_TO_SPEECH_ACTIONS.SET_USE_BASE64,
    payload: useBase64
  }),
  
  setAudioUrl: (audioUrl) => ({
    type: TEXT_TO_SPEECH_ACTIONS.SET_AUDIO_URL,
    payload: audioUrl
  }),
  
  clearAudio: () => ({
    type: TEXT_TO_SPEECH_ACTIONS.CLEAR_AUDIO
  }),
  
  resetSettings: () => ({
    type: TEXT_TO_SPEECH_ACTIONS.RESET_SETTINGS
  })
};

// Reducer function
export const textToSpeechReducer = (state, action) => {
  switch (action.type) {
    case TEXT_TO_SPEECH_ACTIONS.SET_TEXT:
      return {
        ...state,
        text: action.payload
      };
      
    case TEXT_TO_SPEECH_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
        // Reset voice when language changes
        voice: ''
      };
      
    case TEXT_TO_SPEECH_ACTIONS.SET_VOICE:
      return {
        ...state,
        voice: action.payload
      };
      
    case TEXT_TO_SPEECH_ACTIONS.SET_FORMAT:
      return {
        ...state,
        format: action.payload
      };
      
    case TEXT_TO_SPEECH_ACTIONS.SET_CODEC:
      return {
        ...state,
        codec: action.payload
      };
      
    case TEXT_TO_SPEECH_ACTIONS.SET_RATE:
      return {
        ...state,
        rate: action.payload
      };
      
    case TEXT_TO_SPEECH_ACTIONS.SET_PITCH:
      return {
        ...state,
        pitch: action.payload
      };
      
    case TEXT_TO_SPEECH_ACTIONS.SET_USE_BASE64:
      return {
        ...state,
        useBase64: action.payload
      };
      
    case TEXT_TO_SPEECH_ACTIONS.SET_AUDIO_URL:
      return {
        ...state,
        audioUrl: action.payload
      };
      
    case TEXT_TO_SPEECH_ACTIONS.CLEAR_AUDIO:
      return {
        ...state,
        audioUrl: ''
      };
      
    case TEXT_TO_SPEECH_ACTIONS.RESET_SETTINGS:
      return {
        ...textToSpeechInitialState,
        // Keep the current text but reset everything else
        text: state.text
      };
      
    default:
      return state;
  }
};