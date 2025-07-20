// Action types for ChangeTone page
export const CHANGE_TONE_ACTIONS = {
  SET_INPUT_TEXT: 'SET_INPUT_TEXT',
  SET_FILE: 'SET_FILE',
  SET_TONE: 'SET_TONE',
  SET_TONED_TEXT: 'SET_TONED_TEXT',
  CLEAR_RESULT: 'CLEAR_RESULT',
  CLEAR_FILE: 'CLEAR_FILE',
  RESET_STATE: 'RESET_STATE'
};

// Initial state for ChangeTone page
export const changeToneInitialState = {
  inputText: '',
  file: null,
  tone: 'professional',
  tonedText: ''
};

// Reducer for ChangeTone page
export const changeToneReducer = (state, action) => {
  switch (action.type) {
    case CHANGE_TONE_ACTIONS.SET_INPUT_TEXT:
      return {
        ...state,
        inputText: action.payload
      };
    
    case CHANGE_TONE_ACTIONS.SET_FILE:
      return {
        ...state,
        file: action.payload
      };
    
    case CHANGE_TONE_ACTIONS.SET_TONE:
      return {
        ...state,
        tone: action.payload
      };
    
    case CHANGE_TONE_ACTIONS.SET_TONED_TEXT:
      return {
        ...state,
        tonedText: action.payload
      };
    
    case CHANGE_TONE_ACTIONS.CLEAR_RESULT:
      return {
        ...state,
        tonedText: ''
      };
    
    case CHANGE_TONE_ACTIONS.CLEAR_FILE:
      return {
        ...state,
        file: null
      };
    
    case CHANGE_TONE_ACTIONS.RESET_STATE:
      return changeToneInitialState;
    
    default:
      return state;
  }
};

// Action creators for ChangeTone page
export const changeToneActions = {
  setInputText: (text) => ({
    type: CHANGE_TONE_ACTIONS.SET_INPUT_TEXT,
    payload: text
  }),
  
  setFile: (file) => ({
    type: CHANGE_TONE_ACTIONS.SET_FILE,
    payload: file
  }),
  
  setTone: (tone) => ({
    type: CHANGE_TONE_ACTIONS.SET_TONE,
    payload: tone
  }),
  
  setTonedText: (text) => ({
    type: CHANGE_TONE_ACTIONS.SET_TONED_TEXT,
    payload: text
  }),
  
  clearResult: () => ({
    type: CHANGE_TONE_ACTIONS.CLEAR_RESULT
  }),
  
  clearFile: () => ({
    type: CHANGE_TONE_ACTIONS.CLEAR_FILE
  }),
  
  resetState: () => ({
    type: CHANGE_TONE_ACTIONS.RESET_STATE
  })
};