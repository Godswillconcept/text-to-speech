// Action types for KeyPoints page
export const KEY_POINTS_ACTIONS = {
  SET_INPUT_TEXT: 'SET_INPUT_TEXT',
  SET_FILE: 'SET_FILE',
  SET_SELECTED_COUNT: 'SET_SELECTED_COUNT',
  SET_RESULT: 'SET_RESULT',
  CLEAR_RESULT: 'CLEAR_RESULT',
  CLEAR_FILE: 'CLEAR_FILE',
  RESET_STATE: 'RESET_STATE'
};

// Initial state for KeyPoints page
export const keyPointsInitialState = {
  inputText: '',
  file: null,
  selectedCount: 5,
  result: {
    keyPoints: [],
    pdfUrl: null,
    operationId: null
  }
};

// Reducer for KeyPoints page
export const keyPointsReducer = (state, action) => {
  switch (action.type) {
    case KEY_POINTS_ACTIONS.SET_INPUT_TEXT:
      return {
        ...state,
        inputText: action.payload
      };
    
    case KEY_POINTS_ACTIONS.SET_FILE:
      return {
        ...state,
        file: action.payload
      };
    
    case KEY_POINTS_ACTIONS.SET_SELECTED_COUNT:
      return {
        ...state,
        selectedCount: action.payload
      };
    
    case KEY_POINTS_ACTIONS.SET_RESULT:
      return {
        ...state,
        result: {
          keyPoints: action.payload.keyPoints || [],
          pdfUrl: action.payload.pdfUrl || null,
          operationId: action.payload.operationId || null
        }
      };
    
    case KEY_POINTS_ACTIONS.CLEAR_RESULT:
      return {
        ...state,
        result: {
          keyPoints: [],
          pdfUrl: null,
          operationId: null
        }
      };
    
    case KEY_POINTS_ACTIONS.CLEAR_FILE:
      return {
        ...state,
        file: null
      };
    
    case KEY_POINTS_ACTIONS.RESET_STATE:
      return keyPointsInitialState;
    
    default:
      return state;
  }
};

// Action creators for KeyPoints page
export const keyPointsActions = {
  setInputText: (text) => ({
    type: KEY_POINTS_ACTIONS.SET_INPUT_TEXT,
    payload: text
  }),
  
  setFile: (file) => ({
    type: KEY_POINTS_ACTIONS.SET_FILE,
    payload: file
  }),
  
  setSelectedCount: (count) => ({
    type: KEY_POINTS_ACTIONS.SET_SELECTED_COUNT,
    payload: count
  }),
  
  setResult: (result) => ({
    type: KEY_POINTS_ACTIONS.SET_RESULT,
    payload: result
  }),
  
  clearResult: () => ({
    type: KEY_POINTS_ACTIONS.CLEAR_RESULT
  }),
  
  clearFile: () => ({
    type: KEY_POINTS_ACTIONS.CLEAR_FILE
  }),
  
  resetState: () => ({
    type: KEY_POINTS_ACTIONS.RESET_STATE
  })
};