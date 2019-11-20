import React from 'react';
import Modal from '../Modal';
import './index.scss';

import API from '../../utils/API';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import Cookies from 'js-cookie';

class SignIn extends React.Component {
  state = {
    email: '',
    password: '',
    message: '',
    busy: false
  };

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = event => {
    const { email, password, busy } = this.state;
    event.preventDefault();

    if (busy) return;

    this.setState({ busy: true });

    API.login({ email, password }).then(({ data, status }) => {
      this.setState({ busy: false });

      if (data.msg === 'Login successful') {
        // Close the modal, and call the login function
        this.blankFields();

        const cookie = Cookies.get('user');
        if (cookie) {
          const user = JSON.parse(atob(cookie.split('.')[1]));
          this.props.login(user);
        }
        this.props.close();
      } else {
        this.blankFields();
        this.setState({ message: data.msg });
      }
    });
  };

  blankFields = () => {
    this.setState({ password: '', email: '' });
  };

  close = () => {
    this.setState({
      busy: false,
      password: '',
      email: '',
      message: ''
    });
    this.props.close();
  };

  render() {
    const { email, password, busy, message } = this.state;
    return (
      <Modal isShown={this.props.isShown} close={this.close}>
        <div className="signin-wrapper">
          <label>Sign In</label>
          <form className="signin" onSubmit={this.handleSubmit}>
            <div className="input">
              <label htmlFor="email">Email</label>
              <input
                name="email"
                type="email"
                onChange={this.handleChange}
                value={email}
              />
            </div>
            <div className="input">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                type="password"
                onChange={this.handleChange}
                value={password}
              />
            </div>
            {message ? <p>{message}</p> : null}
            <button disabled={busy}>
              {busy ? (
                <FontAwesomeIcon className="spinning" icon={faSpinner} />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </Modal>
    );
  }
}

export default SignIn;
