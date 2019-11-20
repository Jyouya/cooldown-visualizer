import React from 'react';
import { MenuButton } from '../Menu';
import SignUp from '../../containers/SignUp';
import SignIn from '../../containers/SignIn';
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

  componentDidMount() {
    const cookie = Cookies.get('user');

    if (cookie) {
      const user = JSON.parse(atob(cookie.split('.')[1]));

      if (Date.now() > user.exp * 1000) {
        // Token is expired
        Cookies.remove('user', { path: '/' });
      } else {
        this.props.login(user);
      }
    }
  }

  logout = () => {
    Cookies.remove('user', { path: '/' });
    this.props.logout();
  };

  render() {
    const { isLoggedIn, login, user } = this.props;
    return isLoggedIn ? (
      <>
        <button>
          <FontAwesomeIcon icon={faUser} /> {user.username}
        </button>
        <button onClick={() => this.logout()}>
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
        <SignUp
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
