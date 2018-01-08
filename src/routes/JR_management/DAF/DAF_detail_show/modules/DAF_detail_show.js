/**
 * Created by Maoguijun on 2017/10/14.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../../utils/FetchHelper'
import {host} from '../../../../../config'

export const FETCH_DAF = 'FETCH_DAF';
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

export const newDAF = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/dafs','post',json)
      .then(
        e=>{
          return dispatch(fetchDAFInfo(json.id))
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
          return dispatch(fetchDAFInfo())
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_DAF]    : (state, action) => state.update('DAF',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_DAF_INFO] :(state, action) => state.update('DAFInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function DAFReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
