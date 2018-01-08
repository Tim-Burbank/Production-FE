/**
 * Created by Yurek on 2017/8/21.
 */

import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_TIER4 = 'FETCH_TIER4';
export const FETCH_TIER2 = 'FETCH_TIER2';
export const NEW_TIER2 = 'NEW_TIER2';
export const NEW_TIER3 = 'NEW_TIER3';
export const NEW_TIER4 = 'NEW_TIER4';
export const ALT_TIER2 = 'ALT_TIER2'
export const FETCH_TIER2_INFO = 'FETCH_TIER2_INFO'


export const fetchTier2 = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier2s','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_TIER2,
            payload : e.objs
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

export const fetchTier2Info = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier2s/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_TIER2_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


export const newTier3 = (json,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier3s','post',json)
      .then(
        e=>{
          return dispatch(fetchTier2Info(secId))
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newTier4 = (json,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier4s','post',json)
      .then(
        e=>{
          return dispatch(fetchTier2Info(secId))
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altTier3 = (id,json,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier3s/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchTier2Info(secId))
        }
      )
      .catch(e=>({error:e}))
  }
}



export const altTier4 = (id,json,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier4s/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchTier2Info(secId))
        }
      )
      .catch(e=>({error:e}))
  }
}



export const delTier3 = (id,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier3s/'+id,'delete')
      .then(
        e=>{
          return dispatch(fetchTier2Info(secId))
        }
      )
      .catch(e=>({error:e}))
  }
}

export const delTier4 = (id,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier4s/'+id,'delete')
      .then(
        e=>{
          return dispatch(fetchTier2Info(secId))
        }
      )
      .catch(e=>({error:e}))
  }
}

export const moveTier = (json,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'stage2/migrateTier','put',json)
      .then(
        e=>{
          if(secId){
            return dispatch(fetchTier2Info(secId))
          }
        }
      )
      .catch(e=>({error:e}))
  }
}



export const updateEstimateCost = (json,method,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/estimateCosts',method,json)
      .then(
        e=>{
          if(secId){
            return dispatch(fetchTier2Info(secId))
          }
        }
      )
      .catch(e=>({error:e}))
  }
}


export const updateTier2= (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/tier2s/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchTier2Info(id))
        }
      )
      .catch(e=>({error:e}))

  }
}



export const newPro = (json,id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/projects/','post',json)
      .then(
        e=>{
          return dispatch(fetchTier2Info(id))
        }
      )
      .catch(e=>({error:e}))

  }
}
export const altPro= (id,json,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/projects/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchTier2Info(secId))
        }
      )
      .catch(e=>({error:e}))

  }
}




export const delPro = (id,secId) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/projects/'+id,'delete')
      .then(
        e=>{
          return dispatch(fetchTier2Info(secId))
        }
      )
      .catch(e=>({error:e}))
  }
}

const ACTION_HANDLERS = {
  [FETCH_TIER4]    : (state, action) => state.update('tier4',() =>Immutable.fromJS(action.payload)),
  [FETCH_TIER2]    : (state, action) => state.update('tier2',() =>Immutable.fromJS(action.payload)),
  [FETCH_TIER2_INFO] :(state, action) => state.update('tier2Info',() =>Immutable.fromJS(action.payload))
};


// ------------------------------------
// Reducer
// ------------------------------------
export default function tier2Reducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
