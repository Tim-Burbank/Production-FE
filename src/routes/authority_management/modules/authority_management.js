/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../utils/FetchHelper'
import {host} from '../../../config'

export const FETCH_AUTHORITY = 'FETCH_AUTHORITY';
export const NEW_AUTHORITY = 'NEW_AUTHORITY';
export const ALT_AUTHORITY = 'ALT_AUTHORITY'
export const FETCH_AUTHORITY_INFO = 'FETCH_AUTHORITY_INFO'
export const FETCH_ROLES = 'FETCH_ROLES'
export const FETCH_LDAP = 'FETCH_LDAP'
export const FETCH_LDAP_DEP = 'FETCH_LDAP_DEP'



export const fetchAuthority = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/accounts','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_AUTHORITY,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }
}

export const fetchLdap = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/ldap/accounts','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_LDAP,
            payload : e.objs
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchLdapDep = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/ldap/departments','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_LDAP_DEP,
            payload : e.objs
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchRoles = () => {
  return (dispatch, getState) => {
    return easyfetch(host,'/roles','get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_ROLES,
            payload : e.objs
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchAuthorityInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/accounts/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_AUTHORITY_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newAuthority = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/accounts','post',json)
      .then(
        e=>{
          return dispatch(fetchAuthority())
        }
      )
      .catch(e=>({error:e}))

  }
}


export const altAuthority = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/accounts/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchAuthority())
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_AUTHORITY]      : (state, action) => state.update('authority',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_AUTHORITY_INFO] : (state, action) => state.update('authorityInfo',() =>Immutable.fromJS(action.payload)),
  [FETCH_ROLES]          : (state, action) => state.update('roles',() =>Immutable.fromJS(action.payload)),
  [FETCH_LDAP]           : (state, action) => state.update('ldap',() =>Immutable.fromJS(action.payload)),
  [FETCH_LDAP_DEP]       : (state, action) => state.update('ldapDep',() =>Immutable.fromJS(action.payload)),
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function authorityReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
