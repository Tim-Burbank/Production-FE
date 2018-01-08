/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_PERSONAL_INFORMATION = 'FETCH_PERSONAL_INFORMATION';
export const FETCH_MESSAGES = 'FETCH_MESSAGES';
export const ALT_MESSAGES= 'ALT_MESSAGES'


export const fetchPersonalInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/accounts/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_PERSONAL_INFORMATION,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


export const fetchMessages = () => {
  return (dispatch, getState) => {
    return easyfetch(host,'/messages','get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_MESSAGES,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


export const altMessages = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/messages','put',json)
      .then(
        e=>{
          return dispatch(fetchMessages())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const delSign = (json,id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/accounts/signature','delete',json)
      .then(
        e=>{
          return dispatch(fetchPersonalInfo(id))
        }
      )
      .catch(e=>({error:e}))

  }
}



const ACTION_HANDLERS = {
  [FETCH_PERSONAL_INFORMATION]    : (state, action) => state.update('personalInformation',() =>Immutable.fromJS(action.payload)),
  [FETCH_MESSAGES]                : (state, action) => state.update('messages',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function personalInformationReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
