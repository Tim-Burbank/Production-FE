/**
 * Created by Yurek on 2017/8/21.
 */

import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'


export const FETCH_DAF = 'FETCH_DAF';
export const NEW_DAF = 'NEW_DAF';
export const ALT_DAF = 'ALT_DAF'
export const FETCH_DAF_INFO = 'FETCH_DAF_INFO'

export const fetchDAF = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/dafs','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_DAF,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchDAFInfo = (id) => {
  console.log('aaaaaaaaaaaaaa')
  return (dispatch, getState) => {
    return easyfetch(host,'/dafs/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_DAF_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newDAF = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/dafs','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_DAF,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


export const altDAF = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/dafs/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchDAFInfo(id))
        }
      )
      .catch(e=>({error:e}))
  }
}

const ACTION_HANDLERS = {
  [FETCH_DAF]    : (state, action) => state.update('DAF',() =>Immutable.fromJS(action.payload.rows)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_DAF_INFO] :(state, action) => state.update('DAFInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function DAFReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
