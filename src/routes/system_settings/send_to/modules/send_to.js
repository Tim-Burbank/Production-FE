/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_SEND_TO = 'FETCH_SEND_TO';
export const NEW_SEND_TO = 'NEW_SEND_TO';
export const ALT_SEND_TO = 'ALT_SEND_TO'
export const FETCH_SEND_TO_INFO = 'FETCH_SEND_TO_INFO'

export const fetchSendTo = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/sentTos','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_SEND_TO,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchSendToInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/sentTos/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_SEND_TO_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newSendTo = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/sentTos','post',json)
      .then(
        e=>{
          return dispatch(fetchSendTo())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altSendTo = (action,id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/sentTos/'+action+'/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchSendTo())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const updateSendTo = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/sentTos/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchSendTo())
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_SEND_TO]    : (state, action) => state.update('sendTo',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_SEND_TO_INFO] :(state, action) => state.update('sendToInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function sendToReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
