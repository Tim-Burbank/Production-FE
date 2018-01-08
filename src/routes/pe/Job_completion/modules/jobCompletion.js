/**
 * Created by Yurek on 2017/8/21.
 */

import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_JOBC = 'FETCH_JOBC';
export const NEW_JOBC = 'NEW_JOBC';
export const ALT_JOBC = 'ALT_JOBC'
export const FETCH_JOBC_INFO = 'FETCH_JOBC_INFO'



export const fetchJobC = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/completions','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_JOBC,
            payload : e
          })
        }

      )
      .catch(e=>({error:e}))

  }
}


export const fetchJobCInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/completions/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_JOBC_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}



export const newJobC = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/completions','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_JOBC,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}




export const altJobC = (opt,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/completions/'+opt,'put',json)
      .then(
        e=>{
          return dispatch(fetchJobC())
        }
      )
      .catch(e=>({error:e}))
  }
}

const ACTION_HANDLERS = {
  [FETCH_JOBC]    : (state, action) => state.update('jobCompletion',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_JOBC_INFO] :(state, action) => state.update('jobCompletionInfo',() =>Immutable.fromJS(action.payload)),


};

// ------------------------------------
// Reducer
// ------------------------------------
export default function jobCompletionReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
