import axios from 'axios';

export default {
  login: function(data) {
    return axios.post('/login', data);
  },

  register: function(data) {
    return axios.post('/register', data);
  },

  logout: function() {
    return axios.post('/logout', {});
  },

  getFights: function() {
    return axios.get('/api/fights');
  },

  getFight: function(fight) {
    return axios.get('/api/fights/' + fight);
  },

  getDefaultParty: function() {
    return axios.get('/api/user/defaultParty');
  },

  getEncounterPlan: function(id) {
    return axios.get('/api/plans/' + id);
  },

  getFiles: function() {
    return axios.get('/api/myFiles');
  }
};
