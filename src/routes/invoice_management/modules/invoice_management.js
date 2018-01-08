/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../utils/FetchHelper'
import {host} from '../../../config'
import { fetchInvoicesInfo } from '../invoice_detail/modules/invoice_detail'

export const FETCH_INVOICE = 'FETCH_INVOICE';
export const NEW_INVOICE = 'NEW_INVOICE';
export const ALT_INVOICE = 'ALT_INVOICE'
export const FETCH_INVOICE_INFO = 'FETCH_INVOICE_INFO'
export const FETCH_COLLECTIONLOG = 'FETCH_COLLECTIONLOG'

export const fetchInvoice = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_INVOICE,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }

}

//export const fetchInvoiceInfo = (id) => {
//  return (dispatch, getState) => {
//    return easyfetch(host,'/invoices/'+id,'get')
//      .then(
//        e=>{
//          return dispatch({
//            type    : FETCH_INVOICE_INFO,
//            payload : e.obj
//          })
//        }
//      )
//      .catch(e=>({error:e}))
//
//  }
//}

export const newInvoice = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_INVOICE,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }
}

export const altInvoice = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchInvoice())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const opInvoice = (json,id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/operation','put',json)
      .then(
        e=>{
          if(id){
            return dispatch(fetchInvoicesInfo(id))
          }else{
            return dispatch(fetchInvoice())
          }
        }
      )
      .catch(e=>({error:e}))
  }
}

export const fetchCollectionLog = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/collectionRecords/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_COLLECTIONLOG,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))
  }
}





const ACTION_HANDLERS = {
  [FETCH_INVOICE]    : (state, action) => state.update('invoices',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)).update('currencyAllCN',() =>Immutable.fromJS(action.payload.CNY)).update('currencyAllUS',() =>Immutable.fromJS(action.payload.USD)),
  [FETCH_COLLECTIONLOG]:(state, action) => state.update('collectionLog',() =>Immutable.fromJS(action.payload.objs))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function invoicesReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
