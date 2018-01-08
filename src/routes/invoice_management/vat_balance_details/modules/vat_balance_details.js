/**
 * Created by Maoguijun on 2017/8/14.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_VAT_BALANCE = 'FETCH_VAT_BALANCE';
export const NEW_VAT_BALANCE = 'NEW_VAT_BALANCE';
export const UPDATE_VAT_BALANCE = 'UPDATE_VAT_BALANCE';
export const ALT_VAT_BALANCE = 'ALT_VAT_BALANCE'
export const FETCH_VAT_BALANCE_INFO = 'FETCH_VAT_BALANCE_INFO'
export const FETCH_DISABLE = 'FETCH_DISABLE'

export const fetchVatBalance = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vatBalances', 'get', json)
      .then(
      e => {
          return dispatch({
            type    : FETCH_VAT_BALANCE,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchVatBalanceInfo = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vatBalances/','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_VAT_BALANCE_INFO,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newVatBalance = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vatBalances','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_VAT_BALANCE,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
};

export const updateVatBalance = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vatBalances/'+id,'put',json)
      .then(
        e=>{
          return dispatch({
            type    : UPDATE_VAT_BALANCE,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altVatBalance = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vatBalances/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchVatBalance())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchDisable = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/discard/VATBalance/'+id,'get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_DISABLE,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_VAT_BALANCE]    : (state, action) => state.update('VatBalance',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_VAT_BALANCE_INFO] :(state, action) => state.update('VatBalanceInfo',() =>Immutable.fromJS(action.payload)).update('formItems',()=>Immutable.fromJS(action.payload.obj)).update('invoices',()=>Immutable.fromJS(action.payload.invoices)).update('vats',()=>Immutable.fromJS(action.payload.vats)),
  [FETCH_DISABLE]:(state,action) => state.update('vatsDisable',()=>Immutable.fromJS(action.payload.vats)).update('invsDisable',()=>Immutable.fromJS(action.payload.invs))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function VatBalanceReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

