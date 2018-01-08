/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_REQUISITION = 'FETCH_REQUISITION';
export const NEW_REQUISITION = 'NEW_REQUISITION';
export const ALT_REQUISITION = 'ALT_REQUISITION'
export const FETCH_REQUISITION_INFO = 'FETCH_REQUISITION_INFO'

export const fetchRequisition = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/applies','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_REQUISITION,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchRequisitionInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/applies/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_REQUISITION_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newRequisition = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/applies','post',json)
      .then(
        e=>{
          return dispatch(fetchRequisition())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altRequisition = (action,id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/applies/'+action+'/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchRequisition({applyStatus:'toApproveByFM',}))
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_REQUISITION]    : (state, action) => state.update('requisition',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_REQUISITION_INFO] :(state, action) => state.update('requisitionInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function requisitionReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
