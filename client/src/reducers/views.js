import { SET_VIEWS } from '../actionTypes';

const initialState = [];

export const views = (state = initialState, action) => {
  switch (action.type) {
    case SET_VIEWS:
      return action.views;
    default:
      return state;
  }
};
