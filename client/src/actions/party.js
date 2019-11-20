import {
  SET_PARTY,
  ADD_PARTY_MEMBER,
  REMOVE_PARTY_MEMBER,
  UPDATE_MEMBER
} from '../actionTypes';

export const setParty = party => ({
  type: SET_PARTY,
  party
});

export const addPartyMember = member => ({
  type: ADD_PARTY_MEMBER,
  id: member.id,
  member
});

export const removePartyMember = id => ({
  type: REMOVE_PARTY_MEMBER,
  id
});

export const updateMember = member => ({
  type: UPDATE_MEMBER,
  id: member.id,
  member
});
