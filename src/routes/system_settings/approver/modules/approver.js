/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_APPROVER = 'FETCH_APPROVER';
export const NEW_APPROVER = 'NEW_APPROVER';
export const ALT_APPROVER = 'ALT_APPROVER'
export const FETCH_APPROVER_INFO = 'FETCH_APPROVER_INFO'

export const fetchApprover = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/approvers','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_APPROVER,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchApproverInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/approvers/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_APPROVER_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newApprover = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/approvers','post',json)
      .then(
        e=>{
          return dispatch(fetchApprover())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altApprover = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/approvers/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchApprover())
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_APPROVER]    : (state, action) => state.update('approver',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_APPROVER_INFO] :(state, action) => state.update('approverInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function approverReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
