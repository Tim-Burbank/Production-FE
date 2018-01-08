/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_CLIENTPO = 'FETCH_CLIENTPO';
export const NEW_CLIENTPO = 'NEW_CLIENTPO';
export const ALT_CLIENTPO = 'ALT_CLIENTPO'
export const FETCH_CLIENTPO_INFO = 'FETCH_CLIENTPO_INFO'


export const fetchClientPO = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/billTos','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_CLIENTPO,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchClientPOInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/billTos/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_CLIENTPO_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newClientPO = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/billTos','post',json)
      .then(
        e=>{
          return dispatch(fetchClientPO())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altClientPO = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/billTos/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchClientPO())
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_CLIENTPO]    : (state, action) => state.update('clientPO',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_CLIENTPO_INFO] :(state, action) => state.update('clientPOInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function clientPOReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
