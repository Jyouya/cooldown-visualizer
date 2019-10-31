import React from 'react';
import { MenuButton } from '../Menu';
import Signup from '../Signup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faSignInAlt,
  faPenSquare,
  faUser
} from '@fortawesome/free-solid-svg-icons';

class AccountMenu extends React.Component {
  state = { signupIsOpen: false };
  render() {
    // if logged in, have a button for their username
    // and a logout button

    // if not logged in
    // Sign in
    // Register
    return this.props.isLoggedIn ? (
      <>
        <button>
          <FontAwesomeIcon icon={faUser} /> Username
        </button>
        <button>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </>
    ) : (
      <>
        <button>
          <FontAwesomeIcon icon={faSignInAlt} /> Sign In
        </button>
        <button onClick={() => this.setState({ signupIsOpen: true })}>
          <FontAwesomeIcon icon={faPenSquare} /> Register
        </button>
        <Signup
          isShown={this.state.signupIsOpen}
          close={() => {
            this.setState({ signupIsOpen: false });
          }}
        />
      </>
    );
  }
}

export default AccountMenu;
