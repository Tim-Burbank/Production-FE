/**
 * Created by Maoguijun on 2017/10/14.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../../utils/FetchHelper'
import {host} from '../../../../../config'

export const FETCH_DAF = 'FETCH_DAF';
export const FETCH_CLIENT = 'FETCH_CLIENT';
export const FETCH_PROJECT = 'FETCH_PROJECT';
export const FETCH_VENDOR = 'FETCH_VENDOR';
export const FETCH_GADUSER = 'FETCH_GADUSER';
export const NEW_DAF = 'NEW_DAF';
export const FETCH_DAF_INFO = 'FETCH_DAF_INFO'


export const fetchDAFInfo = (id) => {
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

export const fetchClient = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/clients','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_CLIENT,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}
export const fetchVendor = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_VENDOR,
            payload : e
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
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}
export const fetchGADUser = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/dafs/gad-users','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_GADUSER,
            payload : e
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


export const updateDAF = (id,json) => {
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
  [FETCH_CLIENT]    : (state, action) => state.update('client',() =>Immutable.fromJS(action.payload.objs)),
  [FETCH_PROJECT]    : (state, action) => state.update('project',() =>Immutable.fromJS(action.payload.objs)),
  [FETCH_GADUSER]    : (state, action) => state.update('GADUser',() =>Immutable.fromJS(action.payload.objs)),
  [FETCH_VENDOR]    : (state, action) => state.update('vendor',() =>Immutable.fromJS(action.payload.objs)),
  [FETCH_DAF_INFO] :(state, action) => state.update('DAFInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function DAFReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
