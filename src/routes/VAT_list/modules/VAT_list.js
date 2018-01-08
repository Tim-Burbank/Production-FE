/**
 * Created by Yurek on 2017/8/10.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../utils/FetchHelper'
import {host} from '../../../config'

export const FETCH_VAT = 'FETCH_VAT';
export const NEW_VAT = 'NEW_VAT';
export const UPDATE_VAT = 'UPDATE_VAT';
export const ALT_VAT = 'ALT_VAT'
export const DEL_VAT = 'DEL_VAT'
export const FETCH_VAT_INFO = 'FETCH_VAT_INFO'
export const FETCH_VAT_INV = 'FETCH_VAT_INV'

export const fetchVAT = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vats','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_VAT,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }

}

export const fetchVATInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vats/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_VAT_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))
  }
}

export const fetchVATWithInv = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invWithVats/','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_VAT_INV,
            payload : e.objs
          })
        }
      )
      .catch(e=>({error:e}))
  }
}

export const newVAT = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vats','post',json)
      .then(
        e=>{
          return dispatch(fetchVAT())
        }
      )
      .catch(e=>({error:e}))
  }
}

export const altVAT = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vats/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchVAT())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const delVAT = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vats/'+id,'delete')
      .then(
        e=>{
          return dispatch(fetchVAT())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const updateVAT = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vats/'+id,'put',json)
      .then(
        e=>{
          return dispatch({
            type    : UPDATE_VAT,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }
}





const ACTION_HANDLERS = {
  [FETCH_VAT]    : (state, action) => state.update('vats',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)).update('currencyAllCN',() =>Immutable.fromJS(action.payload.CNY)).update('currencyAllUS',() =>Immutable.fromJS(action.payload.USD)),
  [FETCH_VAT_INFO] :(state, action) => state.update('vatsInfo',() =>Immutable.fromJS(action.payload)),
  [FETCH_VAT_INV] :(state, action) => state.update('vatsInv',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function vatsReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
