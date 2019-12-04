import React from 'react';
import ReactToolTip from 'react-tooltip';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Menu as ContextMenu, Context } from './components/ContextMenu';

import TimelineContainer from './components/TimelineContainer';
import EncounterTimeline from './components/EncounterTimeline';
import Mechanic from './components/Mechanic';
import EncounterOverlay from './components/EncounterOverlay';

import Navbar from './components/Navbar';
import { Radio } from './components/Menu';
import Settings from './components/Settings';
import EncounterMenu from './components/EncounterMenu';
import AccountMenu from './containers/AccountMenu';

import jobs from './data/jobs';
import cooldowns from './data/cooldowns';

import API from './utils/API';

import Encounter from './containers/Encounter';
import Home from './containers/Home';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import uuid4 from 'uuid/v4';
// import dummyCooldown from './utils/dummyCooldown';
import './App.scss';

class App extends React.Component {
  componentDidUpdate() {
    ReactToolTip.rebuild();
  }

  render() {
    // const { zoom, encounterDuration, startOfTime } = this.state;
    // TODO: Try to maintain scroll while zooming
    return (
      <BrowserRouter>
        <Context.Provider value={this.contextRef}>
          <Switch>
            <Route
              path="/plan/:id"
              render={({ history, match }) => (
                <Encounter history={history} encounterId={match.params.id} />
              )}
            />
            <Route
              path="/"
              render={({ history }) => <Home history={history} />}
            />
          </Switch>
          <ContextMenu ref={this.contextRef} />
        </Context.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
