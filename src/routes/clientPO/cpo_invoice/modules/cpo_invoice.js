/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'


export const FETCH_CLIENTPO_INVOICE = 'FETCH_CLIENTPO_INVOICE';
export const NEW_CLIENTPO_INVOICE = 'NEW_CLIENTPO_INVOICE';
export const ALT_CLIENTPO_INVOICE = 'ALT_CLIENTPO_INVOICE'
export const FETCH_COLLECT_LOG = 'FETCH_COLLECT_LOG'



export const fetchClientPO_inv = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clientPos/detail/'+id,'get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_CLIENTPO_INVOICE,
            payload : e.obj
          })
        }
      )

      .catch(e=>({error:e}))

  }


}

export const fetchCollectLog = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/invoices/collectionRecords/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_COLLECT_LOG,
            payload : e.objs
          })
        }
      )
      .catch(e=>({error:e}))
  }
}

const ACTION_HANDLERS = {
  [FETCH_CLIENTPO_INVOICE]    : (state, action) => state.update('cpoInvoice',() =>Immutable.fromJS(action.payload)),
  [FETCH_COLLECT_LOG]         : (state, action) => state.update('collectLog',() =>Immutable.fromJS(action.payload))

};

// ------------------------------------
// Reducer
// ------------------------------------
export default function cpoInvoiceReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
