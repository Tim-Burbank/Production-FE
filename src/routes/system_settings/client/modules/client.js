/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_CLIENT = 'FETCH_CLIENT';
export const NEW_CLIENT = 'NEW_CLIENT';
export const ALT_CLIENT = 'ALT_CLIENT'
export const FETCH_CLIENT_INFO = 'FETCH_CLIENT_INFO'

export const fetchClient = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clients','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_CLIENT,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchClientInfo = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clients/'+id,'get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_CLIENT_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newClient = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clients','post',json)
      .then(
        e=>{
          return dispatch(fetchClient())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altClient = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clients/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchClient())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const disabledClient = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clients/disable/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchClient())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const enabledClient = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clients/enable/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchClient())
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_CLIENT]    : (state, action) => state.update('client',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_CLIENT_INFO] :(state, action) => state.update('clientInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function clientReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
