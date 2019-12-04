import { SET_VIEW_SETTINGS } from '../actionTypes';

const initialState = {
  zoom: 12000,
  snap: true,
  snapTo: 25,
  partyViewFilters: {
    raid: {
      include: true
    },
    heal: {
      include: false
    },
    shield: {
      include: false
    },
    gcd: {
      include: false,
      exclude: false
    },
    img: {
      alias: 'all',
      include: false
    }
  },
  playerViewFilters: {
    img: {
      alias: 'all',
      include: true
    },
    raid: {
      include: false
    },
    heal: {
      include: false
    },
    shield: {
      include: false
    },
    gcd: {
      include: false,
      exclude: false
    }
  }
};

export const viewSettings = (state = initialState, action) => {
  switch (action.type) {
    case SET_VIEW_SETTINGS:
      return action.settings;
    default:
      return state;
  }
};
