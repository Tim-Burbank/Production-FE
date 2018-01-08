/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_JR = 'FETCH_JR';
export const NEW_JR = 'NEW_JR';
export const ALT_JR = 'ALT_JR'
export const FETCH_JR_INFO = 'FETCH_JR_INFO'

export const fetchJr = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/JRTypes','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_JR,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}



export const fetchJrInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/JRTypes/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_JR_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newJr = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/JRTypes','post',json)
      .then(
        e=>{
          return dispatch(fetchJr())
        }
      )
      .catch(e=>({error:e}))

  }
}


export const altJr = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/JRTypes/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchJr())
        }
      )
      .catch(e=>({error:e}))
  }
}

const ACTION_HANDLERS = {
  [FETCH_JR]    : (state, action) => state.update('jr',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_JR_INFO] :(state, action) => state.update('jrInfo',() =>Immutable.fromJS(action.payload)),

};

// ------------------------------------
// Reducer
// ------------------------------------
export default function jrReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
