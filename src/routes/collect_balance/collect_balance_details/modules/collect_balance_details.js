/**
 * Created by Maoguijun on 2017/8/8.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_COLLECT_BALANCE = 'FETCH_COLLECT_BALANCE';
export const NEW_COLLECT_BALANCE = 'NEW_COLLECT_BALANCE';
export const ALT_COLLECT_BALANCE = 'ALT_COLLECT_BALANCE'
export const FETCH_COLLECT_BALANCE_INFO = 'FETCH_COLLECT_BALANCE_INFO'
export const FETCH_DISABLE_COLLECT = 'FETCH_DISABLE_COLLECT'

export const fetchCollectBalance = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/collectBalances', 'get', json)
      .then(
      e => {
          return dispatch({
            type    : FETCH_COLLECT_BALANCE,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchCollectBalanceInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/collectBalances/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_COLLECT_BALANCE_INFO,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newCollectBalance = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/collectBalances','post',json)
      .then(
        e=>{
          return dispatch(fetchCollectBalance())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altCollectBalance = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/collectBalances/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchCollectBalance())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchDisble = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/discard/collectBalance/'+id,'get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_DISABLE_COLLECT,
            payload : e.objs[0]
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_COLLECT_BALANCE]    : (state, action) => state.update('CollectBalance',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_COLLECT_BALANCE_INFO] :(state, action) => state.update('CollectBalanceInfo',() =>Immutable.fromJS(action.payload)).update('formItems',()=>Immutable.fromJS(action.payload.obj)).update('invoices',()=>Immutable.fromJS(action.payload.invoices)).update('vats',()=>Immutable.fromJS(action.payload.vats))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function CollectBalanceReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

