// Action types for Paraphraser page
export const PARAPHRASER_ACTIONS = {
  SET_INPUT_TEXT: 'SET_INPUT_TEXT',
  SET_FILE: 'SET_FILE',
  SET_OUTPUT_TEXT: 'SET_OUTPUT_TEXT',
  SET_TONE: 'SET_TONE',
  SET_COMPLEXITY: 'SET_COMPLEXITY',
  SET_PDF_URL: 'SET_PDF_URL',
  CLEAR_OUTPUT: 'CLEAR_OUTPUT',
  CLEAR_FILE: 'CLEAR_FILE',
  RESET_STATE: 'RESET_STATE'
};

// Initial state for Paraphraser page
export const paraphraserInitialState = {
  inputText: '',
  file: null,
  outputText: '',
  tone: 'neutral',
  complexity: 'maintain',
  pdfUrl: ''
};

// Reducer for Paraphraser page
export const paraphraserReducer = (state, action) => {
  switch (action.type) {
    case PARAPHRASER_ACTIONS.SET_INPUT_TEXT:
      return {
        ...state,
        inputText: action.payload
      };
    
    case PARAPHRASER_ACTIONS.SET_FILE:
      return {
        ...state,
        file: action.payload
      };
    
    case PARAPHRASER_ACTIONS.SET_OUTPUT_TEXT:
      return {
        ...state,
        outputText: action.payload
      };
    
    case PARAPHRASER_ACTIONS.SET_TONE:
      return {
        ...state,
        tone: action.payload
      };
    
    case PARAPHRASER_ACTIONS.SET_COMPLEXITY:
      return {
        ...state,
        complexity: action.payload
      };
    
    case PARAPHRASER_ACTIONS.SET_PDF_URL:
      return {
        ...state,
        pdfUrl: action.payload
      };
    
    case PARAPHRASER_ACTIONS.CLEAR_OUTPUT:
      return {
        ...state,
        outputText: '',
        pdfUrl: ''
      };
    
    case PARAPHRASER_ACTIONS.CLEAR_FILE:
      return {
        ...state,
        file: null
      };
    
    case PARAPHRASER_ACTIONS.RESET_STATE:
      return paraphraserInitialState;
    
    default:
      return state;
  }
};

// Action creators for Paraphraser page
export const paraphraserActions = {
  setInputText: (text) => ({
    type: PARAPHRASER_ACTIONS.SET_INPUT_TEXT,
    payload: text
  }),
  
  setFile: (file) => ({
    type: PARAPHRASER_ACTIONS.SET_FILE,
    payload: file
  }),
  
  setOutputText: (text) => ({
    type: PARAPHRASER_ACTIONS.SET_OUTPUT_TEXT,
    payload: text
  }),
  
  setTone: (tone) => ({
    type: PARAPHRASER_ACTIONS.SET_TONE,
    payload: tone
  }),
  
  setComplexity: (complexity) => ({
    type: PARAPHRASER_ACTIONS.SET_COMPLEXITY,
    payload: complexity
  }),
  
  setPdfUrl: (url) => ({
    type: PARAPHRASER_ACTIONS.SET_PDF_URL,
    payload: url
  }),
  
  clearOutput: () => ({
    type: PARAPHRASER_ACTIONS.CLEAR_OUTPUT
  }),
  
  clearFile: () => ({
    type: PARAPHRASER_ACTIONS.CLEAR_FILE
  }),
  
  resetState: () => ({
    type: PARAPHRASER_ACTIONS.RESET_STATE
  })
};