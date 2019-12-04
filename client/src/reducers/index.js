import { combineReducers } from 'redux';
import { user } from './user';
import { encounter } from './encounter';
import { party } from './party';
import { views } from './views';
import { viewSettings } from './viewSettings';

export default combineReducers({
  user,
  encounter,
  party,
  views,
  viewSettings
});
