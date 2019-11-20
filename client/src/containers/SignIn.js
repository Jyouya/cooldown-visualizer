import { connect } from 'react-redux';
import { login } from '../actions';
import SignIn from '../components/SignIn';

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  login: user => dispatch(login(user))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignIn);
