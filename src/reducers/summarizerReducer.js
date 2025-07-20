// Action types for Summarizer page
export const SUMMARIZER_ACTIONS = {
  SET_INPUT_TEXT: 'SET_INPUT_TEXT',
  SET_FILE: 'SET_FILE',
  SET_SUMMARY_LENGTH: 'SET_SUMMARY_LENGTH',
  SET_SUMMARY_TYPE: 'SET_SUMMARY_TYPE',
  SET_SUMMARY_TEXT: 'SET_SUMMARY_TEXT',
  CLEAR_SUMMARY: 'CLEAR_SUMMARY',
  CLEAR_FILE: 'CLEAR_FILE',
  RESET_STATE: 'RESET_STATE'
};

// Initial state for Summarizer page
export const summarizerInitialState = {
  inputText: '',
  file: null,
  summaryLength: '1',
  summaryType: 'paragraph',
  summaryText: ''
};

// Reducer for Summarizer page
export const summarizerReducer = (state, action) => {
  switch (action.type) {
    case SUMMARIZER_ACTIONS.SET_INPUT_TEXT:
      return {
        ...state,
        inputText: action.payload
      };
    
    case SUMMARIZER_ACTIONS.SET_FILE:
      return {
        ...state,
        file: action.payload
      };
    
    case SUMMARIZER_ACTIONS.SET_SUMMARY_LENGTH:
      return {
        ...state,
        summaryLength: action.payload
      };
    
    case SUMMARIZER_ACTIONS.SET_SUMMARY_TYPE:
      return {
        ...state,
        summaryType: action.payload
      };
    
    case SUMMARIZER_ACTIONS.SET_SUMMARY_TEXT:
      return {
        ...state,
        summaryText: action.payload
      };
    
    case SUMMARIZER_ACTIONS.CLEAR_SUMMARY:
      return {
        ...state,
        summaryText: ''
      };
    
    case SUMMARIZER_ACTIONS.CLEAR_FILE:
      return {
        ...state,
        file: null
      };
    
    case SUMMARIZER_ACTIONS.RESET_STATE:
      return summarizerInitialState;
    
    default:
      return state;
  }
};

// Action creators for Summarizer page
export const summarizerActions = {
  setInputText: (text) => ({
    type: SUMMARIZER_ACTIONS.SET_INPUT_TEXT,
    payload: text
  }),
  
  setFile: (file) => ({
    type: SUMMARIZER_ACTIONS.SET_FILE,
    payload: file
  }),
  
  setSummaryLength: (length) => ({
    type: SUMMARIZER_ACTIONS.SET_SUMMARY_LENGTH,
    payload: length
  }),
  
  setSummaryType: (type) => ({
    type: SUMMARIZER_ACTIONS.SET_SUMMARY_TYPE,
    payload: type
  }),
  
  setSummaryText: (text) => ({
    type: SUMMARIZER_ACTIONS.SET_SUMMARY_TEXT,
    payload: text
  }),
  
  clearSummary: () => ({
    type: SUMMARIZER_ACTIONS.CLEAR_SUMMARY
  }),
  
  clearFile: () => ({
    type: SUMMARIZER_ACTIONS.CLEAR_FILE
  }),
  
  resetState: () => ({
    type: SUMMARIZER_ACTIONS.RESET_STATE
  })
};