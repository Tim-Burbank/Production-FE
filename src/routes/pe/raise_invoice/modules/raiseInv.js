/**
 * Created by Yurek on 2017/8/21.
 */

import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_RAISE_INV = 'FETCH_RAISE_INV';
export const NEW_RAISE_INV = 'NEW_RAISE_INV';
export const ALT_RAISE_INV = 'ALT_RAISE_INV'
export const FETCH_RAISE_INV_INFO = 'FETCH_RAISE_INV_INFO'

export const fetchRaiseInv = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/raiseInvoices','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_RAISE_INV,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }
}


export const fetchRaiseInvInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/raiseInvoices/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_RAISE_INV_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}



export const newRaiseInv = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/raiseInvoices','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_RAISE_INV,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}




export const altRaiseInv = (opt,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/raiseInvoices/'+opt,'put',json)
      .then(
        e=>{
          return dispatch(fetchRaiseInv())
        }
      )
      .catch(e=>({error:e}))
  }
}

const ACTION_HANDLERS = {
  [FETCH_RAISE_INV]    : (state, action) => state.update('raiseInv',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_RAISE_INV_INFO] :(state, action) => state.update('raiseInvInfo',() =>Immutable.fromJS(action.payload)),


};

// ------------------------------------
// Reducer
// ------------------------------------
export default function raiseInvReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
