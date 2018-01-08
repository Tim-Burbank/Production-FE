/**
 * Created by Yurek on 2017/8/21.
 */

import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_JRMAIN = 'FETCH_JRMAIN';
export const NEW_JRMAIN = 'NEW_JRMAIN';
export const ALT_JRMAIN = 'ALT_JRMAIN'
export const FETCH_JRMAIN_INFO = 'FETCH_JRMAIN_INFO'
export const FETCH_PROJECT = 'FETCH_PROJECT'
export const CAL_WHT = 'CAL_WHT'
export const NEW_JR_ID = 'NEW_JR_ID'
export const FETCH_TIER4 = 'FETCH_TIER4'


export const fetchJRMain = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/jrs','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_JRMAIN,
            payload : e
          })
        }

      )
      .catch(e=>({error:e}))

  }
}

export const fetchTier4 = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier4s','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_TIER4,
            payload : e.objs
          })
        }

      )
      .catch(e=>({error:e}))

  }
}

export const fetchJRId = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/jrs/newid','get',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_JR_ID,
            payload : e.id
          })
        }

      )
      .catch(e=>({error:e}))

  }
}

export const fetchProject = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/projects','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_PROJECT,
            payload : e.objs
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchJRMainInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/jrs/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_JRMAIN_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchWht = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/calculateWHT','get',json)
      .then(
        e=>{
          return dispatch({
            type    : CAL_WHT,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newJRMain = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/jrs','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_JRMAIN,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}




export const altJRMain = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/jrs/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchJRMainInfo(id))
        }
      )
      .catch(e=>({error:e}))
  }
}

export const altJROpt = (id,opt) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/jrs/'+id+'/'+opt,'put')
      .then(
        e=>{
          return dispatch(fetchJRMainInfo(id))
        }
      )
      .catch(e=>({error:e}))
  }
}

export const abdJR = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/jrs/abandon/'+id,'put')
      .then(
        e=>{
          return dispatch(fetchJRMainInfo(id))
        }
      )
      .catch(e=>({error:e}))
  }
}

const ACTION_HANDLERS = {
  [FETCH_JRMAIN]    : (state, action) => state.update('JR',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_JRMAIN_INFO] :(state, action) => state.update('JRInfo',() =>Immutable.fromJS(action.payload)),
  [FETCH_PROJECT] :(state, action) => state.update('project',() =>Immutable.fromJS(action.payload)),
  [CAL_WHT] :(state, action) => state.update('wht',() =>Immutable.fromJS(action.payload)),
  [NEW_JR_ID]:(state, action) => state.update('JRId',() =>Immutable.fromJS(action.payload)),
  [FETCH_TIER4]:(state, action) => state.update('tier4',() =>Immutable.fromJS(action.payload)),

};

// ------------------------------------
// Reducer
// ------------------------------------
export default function JRReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
