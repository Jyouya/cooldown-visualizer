import { connect } from 'react-redux';
import { login } from '../actions';
import SignUp from '../components/SignUp';

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  login: user => dispatch(login(user))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUp);
