import React from 'react';
import { MenuButton } from '../Menu';
import Signup from '../Signup';
import SignIn from '../SignIn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faSignInAlt,
  faPenSquare,
  faUser
} from '@fortawesome/free-solid-svg-icons';

import Cookies from 'js-cookie';
import API from '../../utils/API';

class AccountMenu extends React.Component {
  state = { showSignUp: false, showSignIn: false };

  logout = () => {
    // API.logout();
    Cookies.remove('user', { path: '/' });
    this.props.login(false);
  };

  render() {
    const { isLoggedIn, login } = this.props;
    return isLoggedIn ? (
      <>
        <button>
          <FontAwesomeIcon icon={faUser} /> {isLoggedIn}
        </button>
        <button onClick={() => this.logout(false)}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </>
    ) : (
      <>
        <button onClick={() => this.setState({ showSignIn: true })}>
          <FontAwesomeIcon icon={faSignInAlt} /> Sign In
        </button>
        <button onClick={() => this.setState({ showSignUp: true })}>
          <FontAwesomeIcon icon={faPenSquare} /> Register
        </button>
        <Signup
          isShown={this.state.showSignUp}
          login={login}
          close={() => {
            this.setState({ showSignUp: false });
          }}
        />
        <SignIn
          isShown={this.state.showSignIn}
          login={login}
          close={() => {
            console.log('closing signin modal');
            this.setState({ showSignIn: false });
          }}
        />
      </>
    );
  }
}

export default AccountMenu;
