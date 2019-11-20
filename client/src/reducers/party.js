import {
  SET_PARTY,
  ADD_PARTY_MEMBER,
  REMOVE_PARTY_MEMBER,
  UPDATE_MEMBER
} from '../actionTypes';

const initialState = {};

export const party = (state = initialState, action) => {
  switch (action.type) {
    case SET_PARTY:
      return action.party;
    case ADD_PARTY_MEMBER:
      return { ...state, [action.id]: action.member };
    case REMOVE_PARTY_MEMBER:
      const { [action.id]: _, ...copy } = state;
      return copy;
    case UPDATE_MEMBER:
      return { ...state, [action.id]: action.member };
    default:
      return state;
  }
};
