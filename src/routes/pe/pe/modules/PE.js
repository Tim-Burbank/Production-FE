/**
 * Created by Yurek on 2017/8/21.
 */

import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_PEMAIN = 'FETCH_PEMAIN';
export const NEW_PEMAIN = 'NEW_PEMAIN';
export const ALT_PEMAIN = 'ALT_PEMAIN'
export const FETCH_PEMAIN_INFO = 'FETCH_PEMAIN_INFO'
export const NEW_RAISE_INV = 'NEW_RAISE_INV'
export const NEW_COM_JOB = 'NEW_COM_JOB'

export const fetchPEMain = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/pes','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_PEMAIN,
            payload : e
          })
        }

      )
      .catch(e=>({error:e}))

  }
}


export const fetchPEMainInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/pes/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_PEMAIN_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}



export const newPEMain = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/pes','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_PEMAIN,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}




export const altPEMain = (id,opt,json) => {
  console.log('ppppp',json)
  return (dispatch, getState) => {
    return easyfetch(host,'/pes/'+id+'/'+opt,'put',json)
      .then(
        e=>{
          return dispatch(fetchPEMainInfo(id))
        }
      )
      .catch(e=>({error:e}))
  }
}

export const raiseInv = (json) => {
  console.log('ppppp',json)
  return (dispatch, getState) => {
    return easyfetch(host,'/raiseInvoices','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_RAISE_INV,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))
  }
}

export const completeJob = (json) => {
  console.log('ppppp',json)
  return (dispatch, getState) => {
    return easyfetch(host,'/completions','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_COM_JOB,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))
  }
}



const ACTION_HANDLERS = {
  [FETCH_PEMAIN]    : (state, action) => state.update('PE',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_PEMAIN_INFO] :(state, action) => state.update('PEInfo',() =>Immutable.fromJS(action.payload)),


};

// ------------------------------------
// Reducer
// ------------------------------------
export default function PEReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
