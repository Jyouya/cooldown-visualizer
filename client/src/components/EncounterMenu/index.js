import React from 'react';
import { Menu, MenuButton, MenuItem, MenuHover, MenuSeparator } from '../Menu';
import API from '../../utils/API';

class EncounterMenu extends React.Component {
  state = {
    encounters: {
      current: { ultimate: [], savage: [], extreme: [] },
      old: { ultimate: [], savage: [], extreme: [] }
    }
  };

  componentDidMount() {
    API.getFights().then(({ data }) => {
      const { patch, fights } = data;

      const encounters = {
        current: { ultimate: [], savage: [], extreme: [] },
        old: { ultimate: [], savage: [], extreme: [] }
      };

      const [major, minor] = patch.split('.').map(Number);

      fights.forEach(({ type, name, url, patch }) => {
        const [eMajor, eMinor] = patch.split('.').map(Number);

        const current =
          eMajor === major &&
          (type === 'ultimate' ||
            (type === 'extreme' && eMinor === minor) ||
            (type === 'savage' && eMinor <= minor && minor < eMinor + 2));

        encounters[current ? 'current' : 'old'][type].push({ name, url });
      });

      this.setState({ encounters });
    });
  }

  newEncounter = async url => {
    const { data } = await API.getFight(url);
    this.props.setEncounter(data);
    this.props.buildDefaultParty();
  };

  generateMenu(encounters) {
    return Object.entries(encounters).map(([type, encounters], i) =>
      encounters.map(({ name, url }, j) => (
        <MenuItem
          key={10 * i + j + 1}
          onClick={() => this.newEncounter(url)}
          closeOnClick
        >
          {name}
        </MenuItem>
      ))
    );
  }

  render() {
    const { current, old } = this.state.encounters;
    return (
      <MenuButton label="Encounter" radio={this.props.radio}>
        <Menu menuClass="dark" bottom radioDelay={300}>
          <MenuItem>
            <MenuHover label="New" arrow>
              <Menu side>
                {this.generateMenu(current)}
                {old.length ? (
                  <>
                    <MenuSeparator />
                    <MenuItem>
                      <MenuHover label="Older Content" arrow>
                        <Menu side>{this.generateMenu(old)}</Menu>
                      </MenuHover>
                    </MenuItem>
                  </>
                ) : null}
              </Menu>
            </MenuHover>
          </MenuItem>
        </Menu>
      </MenuButton>
    );
  }
}

export default EncounterMenu;
