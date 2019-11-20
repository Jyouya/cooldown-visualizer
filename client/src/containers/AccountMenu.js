import { connect } from 'react-redux';
import { login, logout } from '../actions';
import AccountMenu from '../components/AccountMenu';

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
  user: state.user.user || null
});

const mapDispatchToProps = dispatch => ({
  login: user => dispatch(login(user)),
  logout: () => dispatch(logout())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountMenu);
