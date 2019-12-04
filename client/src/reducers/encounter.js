import { SET_MECHANICS } from '../actionTypes';

const initialState = {
  mechanicTimeline: [],
  startOfTime: 0,
  duration: 1,
  mechanics: []
};

export const encounter = (state = initialState, action) => {
  switch (action.type) {
    case SET_MECHANICS:
      return {
        mechanicTimeline: action.timeline,
        mechanics: action.mechanics,
        startOfTime: action.startOfTime,
        duration: action.duration
      };

    default:
      return state;
  }
};
