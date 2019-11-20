import { combineReducers } from 'redux';
import { user } from './user';
import { encounter } from './encounter';
import { party } from './party';
import { views } from './views';

export default combineReducers({
  user,
  encounter,
  party,
  views
});
