/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_INVOICES = 'FETCH_INVOICES';
export const NEW_INVOICES = 'NEW_INVOICES';
export const ALT_INVOICES = 'ALT_INVOICES'
export const APPRO_INVOICES = 'APPRO_INVOICES'
export const FETCH_INVOICES_INFO = 'FETCH_INVOICES_INFO'
export const DEL_INVOICES = 'DEL_INVOICES'
export const FETCH_PAYOFF_ID = 'FETCH_PAYOFF_ID'

export const fetchInvoicesInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_INVOICES_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchPayOffId = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/newId/','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_PAYOFF_ID,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newInvoices = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_INVOICES,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altInvoices = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/'+id,'put',json)
      .then(
        e=>{
          //return dispatch(fetchInvoicesInfo(id))
          return dispatch({
            type    : ALT_INVOICES,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}



export const delInvoices = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/'+id,'delete')
      .then(
        e=>{
          return dispatch({
            type    : DEL_INVOICES,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


export const ApprovalInvoices = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/fdApprove/'+id,'put',json)
      .then(
        e=>{
          return dispatch({
            type    : APPRO_INVOICES,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))
  }
}

export const chargeInvoices = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/charge','post',json)
      .then(
        e=>{
          return dispatch(fetchInvoicesInfo(id))
        }
      )
      .catch(e=>({error:e}))

  }
}

const ACTION_HANDLERS = {
  [FETCH_INVOICES_INFO] :(state, action) => state.update('invoicesInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function invoicesReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
