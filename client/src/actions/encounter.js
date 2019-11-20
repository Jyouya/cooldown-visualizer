import { SET_MECHANICS } from '../actionTypes';

export const setMechanics = (
  mechanics,
  timeline,
  startOfTime,
  duration
) => ({
  type: SET_MECHANICS,
  mechanics,
  timeline,
  startOfTime,
  duration
});
