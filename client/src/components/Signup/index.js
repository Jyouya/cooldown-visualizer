import React from 'react';
import Modal from '../Modal';
import './index.scss';

import API from '../../utils/API';
import Cookies from 'js-cookie';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const validate = {
  username: str => (str ? /[^<>;&/'"]+/.test(str) : true),
  email: str => (str ? /.+@.+\..+/.test(str) : true),
  password: str =>
    str
      ? /.{8}/.test(str) &&
        [/(?=.*[A-Z])(?=.*[a-z])/, /[^a-z ]/i, /(?=.*[a-z])(?=.*\d)/i].filter(
          regex => regex.test(str)
        ).length > 1
      : true
};

class SignUp extends React.Component {
  state = {
    username: '',
    email: '',
    password: '',
    busy: false,
    message: '',
    successful: false
  };

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = event => {
    const { username, email, password, busy } = this.state;
    event.preventDefault();

    if (
      !(
        username &&
        email &&
        password &&
        validate.username(username) &&
        validate.email(email) &&
        validate.password(password)
      ) ||
      busy
    )
      return;

    this.setState({ busy: true });

    API.register({ username, email, password }).then(({ data }) => {
      this.setState({ busy: false });

      if (data.msg === 'Account creation successful') {
        this.setState({ message: data.msg, successful: true });
        const cookie = Cookies.get('user');
        if (cookie) {
          const user = JSON.parse(atob(cookie.split('.')[1]));
          this.props.login(user);
        }
      } else {
        this.setState({ message: data.msg });
      }
    });
  };

  close = () => {
    this.setState({
      busy: false,
      username: '',
      password: '',
      email: '',
      message: '',
      successful: false
    });
    this.props.close();
  };

  render() {
    const { username, email, password, busy, message, successful } = this.state;
    return (
      <Modal isShown={this.props.isShown} close={this.close}>
        <div className="signup-wrapper">
          <label>Create a new account</label>
          <form className="signup" onSubmit={this.handleSubmit}>
            {successful ? (
              <>
                <p>Account Creation Successful</p>
                <button onClick={this.close}>Okay</button>
              </>
            ) : (
              <>
                <div className="input">
                  <label htmlFor="username">Username</label>
                  <input
                    className={validate.username(username) ? null : 'invalid'}
                    name="username"
                    onChange={this.handleChange}
                    value={username}
                  />
                </div>
                <div className="input">
                  <label htmlFor="email">Email</label>
                  <input
                    className={validate.email(email) ? null : 'invalid'}
                    name="email"
                    type="email"
                    onChange={this.handleChange}
                    value={email}
                  />
                </div>
                <div className="input">
                  <label htmlFor="password">Password</label>
                  <input
                    className={validate.password(password) ? null : 'invalid'}
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
                    'Register'
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </Modal>
    );
  }
}

export default SignUp;
