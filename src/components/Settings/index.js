import React from 'react';
import { Menu, MenuButton, MenuItem, MenuHover, MenuToggle } from '../Menu';

class Settings extends React.Component {
  render() {
    const { updateSettings: set, settings } = this.props;
    return (
      <MenuButton label="Settings">
        <Menu menuClass="dark" bottom radioDelay={300}>
          <MenuToggle set={s => set({ snap: s })} on={settings.snap}>
            Snap
          </MenuToggle>
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
