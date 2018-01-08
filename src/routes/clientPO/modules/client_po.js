/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../utils/FetchHelper'
import {host} from '../../../config'

export const FETCH_CLIENTPO = 'FETCH_CLIENTPO';
export const NEW_CLIENTPO = 'NEW_CLIENTPO';
export const ALT_CLIENTPO = 'ALT_CLIENTPO'
export const FETCH_CLIENTPO_INFO = 'FETCH_CLIENTPO_INFO'
export const DEL_CPO = 'DEL_CPO'
export const APPRO_CPO = 'APPRO_CPO'
export const CPO_ID = 'CPO_ID'


export const fetchClientPO = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clientPos','get',json)
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
    return easyfetch(host,'/clientPos/'+id,'get')
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
    return easyfetch(host,'/clientPos','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_CLIENTPO,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }
}

export const altClientPO = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clientPos/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchClientPO())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const disabledCPO = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clientPos/abandon/'+id,'put')
      .then(
        e=>{
          return dispatch({
            type    : DEL_CPO,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }
}



export const agreeCPO = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clientPos/approve/'+id,'put',json)
      .then(
        e=>{
          return dispatch({
            type    : APPRO_CPO,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }
}



export const fetchCPOId = () => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clientPos-newId/','get')
      .then(
        e=>{
          return dispatch({
            type    : CPO_ID,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }
}




const ACTION_HANDLERS = {
  [FETCH_CLIENTPO]    : (state, action) => state.update('clientPO',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)).update('currencyAllCN',() =>Immutable.fromJS(action.payload.CNY)).update('currencyAllUS',() =>Immutable.fromJS(action.payload.USD)),
  [FETCH_CLIENTPO_INFO] :(state, action) => state.update('clientPOInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function clientPOReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
