/**
 * Created by Maoguijun on 2017/8/21.
 */

import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_TIER1 = 'FETCH_TIER1';
export const FETCH_GROUP = 'FETCH_GROUP';
export const FETCH_TIER2 = 'FETCH_TIER2';
export const NEW_TIER1 = 'NEW_TIER1';
export const ALT_TIER1 = 'ALT_TIER1'
export const FETCH_TIER1_INFO = 'FETCH_TIER1_INFO'



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
export const fetchTier1 = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier1s','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_TIER1,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


export const fetchTier1Info = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier1s/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_TIER1_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newTier1= (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier1s','post',json)
      .then(
        e=>{
          return dispatch(fetchTier1())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altTier1 = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier1s/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchTier1())
        }
      )
      .catch(e=>({error:e}))
  }
}

export const fetchTier2 = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier2s','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_TIER2,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

const ACTION_HANDLERS = {
  [FETCH_TIER1]    : (state, action) => state.update('Tier1',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_TIER2]    : (state, action) => state.update('Tier2',() =>Immutable.fromJS(action.payload.objs)),
  [FETCH_GROUP]    : (state, action) => state.update('groups',() =>Immutable.fromJS(action.payload.objs)),
  [FETCH_TIER1_INFO] :(state, action) => state.update('Tier1Info',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function Tier1Reducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
