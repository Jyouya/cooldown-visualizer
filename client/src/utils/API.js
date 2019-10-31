import axios from 'axios';

export default {
  login: function(data) {
    return axios.post('/login', data);
  },

  register: function(data) {
    return axios.post('/register', data);
  },

  logout: function() {
    return axios.get('/logout');
  },

  getFights: function() {
    return axios.get('/api/fights');
  },

  getFight: function(fight) {
    return axios.get('/api/fights/' + fight);
  }
};
