import React from 'react';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuHover,
  MenuToggle,
  MenuSeparator
} from '../Menu';

import PartySetup from '../PartySetup';

class Settings extends React.Component {
  state = {
    showPartySettupModal: false
  };

  render() {
    const { updateSettings: set, settings } = this.props;
    return (
      <>
        <MenuButton label="Settings" radio={this.props.radio}>
          <Menu menuClass="dark" bottom radioDelay={300}>
            <MenuToggle set={s => set({ snap: s })} on={settings.snap}>
              Snap
            </MenuToggle>
            <MenuSeparator />
            <MenuItem
              onClick={() => this.setState({ showPartySettupModal: true })}
              closeOnClick
            >
              Party Setup
            </MenuItem>
            <MenuItem>
              <MenuHover label="Party View Filters" arrow>
                <Menu side>
                  {Object.entries(settings.partyViewFilters).map(
                    ([filter, obj], i) => (
                      <MenuToggle
                        key={i}
                        on={settings.partyViewFilters[filter].include}
                        set={s =>
                          set({
                            partyViewFilters: {
                              ...settings.partyViewFilters,
                              [filter]: { ...obj, include: s }
                            }
                          })
                        }
                      >
                        {titleCase(obj.alias || filter)}
                      </MenuToggle>
                    )
                  )}
                </Menu>
              </MenuHover>
            </MenuItem>
            <MenuItem>
              <MenuHover label="Player View Filters" arrow>
                <Menu side>
                  {Object.entries(settings.playerViewFilters).map(
                    ([filter, obj], i) => (
                      <MenuToggle
                        key={i}
                        on={settings.playerViewFilters[filter].include}
                        set={s =>
                          set({
                            playerViewFilters: {
                              ...settings.playerViewFilters,
                              [filter]: { ...obj, include: s }
                            }
                          })
                        }
                      >
                        {titleCase(obj.alias || filter)}
                      </MenuToggle>
                    )
                  )}
                </Menu>
              </MenuHover>
            </MenuItem>
          </Menu>
        </MenuButton>
        <PartySetup
          isShown={this.state.showPartySettupModal}
          close={() => this.setState({ showPartySettupModal: false })}
          save={party => set({ party })}
          party={this.props.settings.party}
        />
      </>
    );
  }
}

function titleCase(str) {
  return str
    .split(' ')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export default Settings;
