import { LOGIN, LOGOUT } from '../actionTypes';

const initialState = {
  isLoggedIn: false,
  user: {}
};

export const user = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        isLoggedIn: true,
        user: action.user
      };
    case LOGOUT:
      return {
        isLoggedIn: false,
        user: {}
      };
    default:
      return state;
  }
};
