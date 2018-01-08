/**
 * Created by Yurek on 2017/8/21.
 */

import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_GROUP = 'FETCH_GROUP';
export const NEW_GROUP = 'NEW_GROUP';
export const ALT_GROUP = 'ALT_GROUP'
export const FETCH_GROUP_INFO = 'FETCH_GROUP_INFO'

export const fetchGroup = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/groups','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_GROUP,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchGroupInfo = (id) => {
  console.log('aaaaaaaaaaaaaa')
  return (dispatch, getState) => {
    return easyfetch(host,'/groups/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_GROUP_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newGroup = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/groups','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_GROUP,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


export const altGroup = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/groups/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchGroupInfo(id))
        }
      )
      .catch(e=>({error:e}))
  }
}

const ACTION_HANDLERS = {
  [FETCH_GROUP]    : (state, action) => state.update('group',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_GROUP_INFO] :(state, action) => state.update('groupInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function groupReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
